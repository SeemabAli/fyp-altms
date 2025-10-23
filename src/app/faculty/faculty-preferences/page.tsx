/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { facultyPreferenceSchema } from "@/lib/zodSchemas";

interface Course {
  _id: string;
  code: string;
  title: string;
}

export default function FacultyPreferencesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [preferences, setPreferences] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [submittedPrefs, setSubmittedPrefs] = useState<Course[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, prefsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/faculty/preferences"),
      ]);
      const coursesData = await coursesRes.json();
      const prefsData = await prefsRes.json();

      setCourses(coursesData.courses || []);
      if (prefsData.submitted) {
        setSubmitted(true);
        setSubmittedPrefs(prefsData.preference.courses || []);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...preferences];
    updated[index] = value;
    setPreferences(updated);
  };

  // 🧠 Dynamically calculate which courses are already selected
  const selectedCourseIds = useMemo(
    () => preferences.filter(Boolean),
    [preferences]
  );

  const availableCourses = useMemo(() => {
    return courses.filter((course) => !selectedCourseIds.includes(course._id));
  }, [courses, selectedCourseIds]);

  const handleSubmit = async () => {
    const parsed = facultyPreferenceSchema.safeParse({ preferences });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/faculty/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Preferences submitted successfully");
        setSubmitted(true);
        fetchInitialData();
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["faculty"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
              style={{ height: "auto" }}
            />
          </div>
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl border-l-4 border-[#d89860] shadow-sm">
          <h1 className="text-2xl font-semibold text-[#493737] mb-2">
            Course Preferences
          </h1>

          {loading ? (
            <div className="text-center text-gray-500 py-6">Loading...</div>
          ) : submitted ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                You have already submitted your preferences. You cannot edit
                them again.
              </p>
              <div className="space-y-3">
                {submittedPrefs.map((course, idx) => (
                  <div
                    key={course._id}
                    className="flex justify-between border rounded-lg p-3 bg-gray-50"
                  >
                    <span className="font-medium text-[#493737]">
                      {idx + 1}. {course.code} - {course.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select <b>5 course preferences</b> from the available list.
              </p>

              <div className="space-y-4">
                {preferences.map((pref, index) => {
                  // dynamically show available + selected value
                  const selectableCourses = [
                    ...availableCourses,
                    ...courses.filter((c) => c._id === pref),
                  ];

                  return (
                    <div key={index} className="flex flex-col">
                      <label className="text-sm text-gray-700 font-medium mb-1">
                        Preference #{index + 1}
                      </label>
                      <select
                        value={pref}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d89860] transition"
                      >
                        <option value="">Select a course</option>
                        {selectableCourses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.code} - {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 w-full py-2 bg-[#d89860] text-white rounded-lg hover:bg-[#c08850] transition flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />{" "}
                    Submitting...
                  </>
                ) : (
                  "Submit Preferences"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
