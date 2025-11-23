/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface Course {
  _id: string;
  code: string;
  title: string;
}

export default function FacultyPreferencesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
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

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCourses.length < 5) {
      toast.error("Please select at least 5 courses");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/faculty/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: selectedCourses }),
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
                Select <b>at least 5 courses</b> from the available list. You
                can select more than 5.
              </p>

              <div className="mb-4 text-sm font-medium text-[#493737]">
                Selected: {selectedCourses.length} course(s)
                {selectedCourses.length < 5 && (
                  <span className="text-red-600 ml-2">
                    (Minimum 5 required)
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {courses.map((course) => {
                  const isSelected = selectedCourses.includes(course._id);
                  return (
                    <label
                      key={course._id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? "bg-[#d89860] bg-opacity-10 border-[#d89860]"
                          : "bg-white border-gray-200 hover:border-[#d89860]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCourseToggle(course._id)}
                        className="w-4 h-4 text-[#d89860] border-gray-300 rounded focus:ring-[#d89860] mr-3"
                      />
                      <span className="font-medium text-[#493737]">
                        {course.code} - {course.title}
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || selectedCourses.length < 5}
                className="mt-6 w-full py-2 bg-[#d89860] text-white rounded-lg hover:bg-[#c08850] transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
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
