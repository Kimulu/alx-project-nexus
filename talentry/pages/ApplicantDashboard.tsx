// src/app/applicant-dashboard/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { LogOut, UserCircle } from "lucide-react"; // Only necessary icons for UI

const ApplicantDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8 sm:p-10 lg:p-12 space-y-8"
      >
        <div className="flex flex-col items-center">
          <UserCircle className="text-[#4640DE] mb-4" size={80} />
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">
            Welcome, Applicant!
          </h1>
          <p className="mt-2 text-lg text-gray-600 text-center">
            This is your Applicant Dashboard.
          </p>
          <p className="mt-1 text-sm text-gray-500 text-center">
            Your User ID:{" "}
            <span className="font-mono text-gray-700 break-all">
              user-id-placeholder-1234567890abcde
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200"
          >
            <h2 className="text-xl font-semibold text-blue-800">My Profile</h2>
            <p className="mt-2 text-blue-700">
              View and update your personal information, contact details, and
              resume.
            </p>
            <button className="mt-4 text-blue-600 hover:underline font-medium">
              Go to Profile &rarr;
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200"
          >
            <h2 className="text-xl font-semibold text-green-800">
              Applied Jobs
            </h2>
            <p className="mt-2 text-green-700">
              Track the status of your job applications and review past
              submissions.
            </p>
            <button className="mt-4 text-green-600 hover:underline font-medium">
              View Applications &rarr;
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-200"
          >
            <h2 className="text-xl font-semibold text-purple-800">
              Job Alerts
            </h2>
            <p className="mt-2 text-purple-700">
              Manage your job alert preferences and discover new opportunities.
            </p>
            <button className="mt-4 text-purple-600 hover:underline font-medium">
              Manage Alerts &rarr;
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-200"
          >
            <h2 className="text-xl font-semibold text-yellow-800">
              Saved Jobs
            </h2>
            <p className="mt-2 text-yellow-700">
              Access your saved job listings to apply later.
            </p>
            <button className="mt-4 text-yellow-600 hover:underline font-medium">
              View Saved Jobs &rarr;
            </button>
          </motion.div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // onClick={handleLogout} // Removed logic
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <LogOut className="mr-2" size={20} />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicantDashboard;
