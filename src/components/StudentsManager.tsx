"use client";

import { useEffect, useState } from "react";
import CreateStudentForm from "@/components/CreateStudentForm";
import DeleteStudentButton from "@/components/DeleteStudentButton";
import EditStudentForm from "@/components/EditStudentForm";

type Student = {
  id: number;
  name: string;
  email: string;
  niveau: string | null;
  groupe: string | null;
};

export default function StudentsManager({ role }: { role: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStudents() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/students", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new Error("Session expirée. Reconnecte-toi.");
        }

        if (response.status === 403) {
          throw new Error("Tu n’as pas accès à cette liste.");
        }

        if (!response.ok) {
          throw new Error("Impossible de charger les étudiants.");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setStudents(data.students);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error ? error.message : "Une erreur est survenue."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => controller.abort();
  }, [refreshKey]);

  if (loading) {
    return <p className="my-6">Chargement des étudiants…</p>;
  }

  if (error) {
    return (
      <div className="my-6">
        <p role="alert" className="text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          className="mt-3 rounded border px-4 py-2"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="my-8">
      <h2 className="mb-4 text-xl font-bold">Liste des étudiants</h2>

      {role === "ADMIN" && (
        <CreateStudentForm
          onCreated={() => setRefreshKey((value) => value + 1)}
        />
      )}

      {editingStudent && (
        <EditStudentForm
          key={editingStudent.id}
          student={editingStudent}
          role={role}
          onCancel={() => setEditingStudent(null)}
          onSaved={() => {
            setEditingStudent(null);
            setRefreshKey((value) => value + 1);
          }}
        />
      )}

      {students.length === 0 ? (
        <p>Aucun étudiant enregistré.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Niveau</th>
                <th className="p-3">Groupe</th>
                {(role === "ADMIN" || role === "ENSEIGNANT") && (
                  <th className="p-3">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">
                    {student.niveau ?? "Non renseigné"}
                  </td>
                  <td className="p-3">
                    {student.groupe ?? "Non renseigné"}
                  </td>

                  {(role === "ADMIN" || role === "ENSEIGNANT") && (
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingStudent(student)}
                          className="rounded bg-blue-600 px-3 py-2 text-white"
                        >
                          Modifier
                        </button>

                        {role === "ADMIN" && (
                          <DeleteStudentButton
                            studentId={student.id}
                            studentName={student.name}
                            onDeleted={() => {
                              if (editingStudent?.id === student.id) {
                                setEditingStudent(null);
                              }

                              setRefreshKey((value) => value + 1);
                            }}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}