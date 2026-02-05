import { useEffect, useState } from "react";
import { getMe } from "../api/user.api";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <DashboardLayout>
      {loading ? (
        <div className="text-gray-400">Loading Profile...</div>
      ) : !user ? (
        <div className="text-red-400">Failed to load user profile.</div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-6">My Profile</h1>

          <div className="bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <ProfileItem label="Name" value={user.name || "—"} />
            <ProfileItem label="Email" value={user.email} />
            <ProfileItem label="Role" value={user.role} />
            <ProfileItem
              label="Joined"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-700 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
