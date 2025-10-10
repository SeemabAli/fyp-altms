/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, UserPlus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import toast from "react-hot-toast";
import UserModal from "./UserModal";
import UserDeleteModal from "./UserDeleteModal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {/* HEADER */}
      <div className="bg-[#493737] text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center gap-3 min-w-[200px] mb-2 sm:mb-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
              alt="VU Logo"
              className="w-8 h-auto"
            />
          </div>
          <span className="text-lg font-semibold">
            Automated Timetable System
          </span>
        </div>
        <LogoutButton />
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl mb-6 border-l-4 shadow-sm border-[#d89860] flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#493737]">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Manage users and system operations
            </p>
          </div>
          <button
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
            className="flex items-center gap-2 bg-[#d89860] hover:bg-[#c08850] text-white px-4 py-2 rounded-lg"
          >
            <UserPlus size={18} /> Add New Member
          </button>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-[#493737] text-white text-sm">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelected(user);
                            setOpen(true);
                          }}
                          className="text-[#d89860] hover:text-[#c08850]"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(user);
                            setDeleteOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <UserModal
        open={open}
        setOpen={setOpen}
        selected={selected}
        refresh={fetchUsers}
      />
      <UserDeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        selected={selected}
        refresh={fetchUsers}
      />
    </ProtectedRoute>
  );
}
