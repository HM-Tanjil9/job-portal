"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  MapPin,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const JobPage = () => {
  const { id } = useParams();
  const token = Cookies.get("token");
  const { user, isAuth, applyJob, applications, btnLoading } = useAppData();
  const router = useRouter();
  const [applied, setApplied] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ CHANGE: Use object to store status per application
  const [updateStatuses, setUpdateStatuses] = useState<{
    [key: number]: string;
  }>({});

  const applyJobHandler = async (id: number) => {
    applyJob(id);
  };

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/${id}`);
      setJob(data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const [jobApplications, setJobApplications] = useState<Application[]>([]);

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(
        `${job_service}/api/job/application/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setJobApplications(data);
    } catch (error) {
      console.log(error);
    }
  }

  const [filterStatus, setFilterStatus] = useState("All");
  const filteredApplications =
    filterStatus === "All"
      ? jobApplications
      : jobApplications.filter((app) => app.status === filterStatus);

  // ✅ CHANGE: Accept application ID and use its specific status
  const updateApplicationHandler = async (applicationId: number) => {
    const statusValue = updateStatuses[applicationId];

    if (!statusValue) {
      return toast.error("Please select a status");
    }

    try {
      const { data } = await axios.put(
        `${job_service}/api/job/application/update/${applicationId}`,
        { status: statusValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(data.message);

      // ✅ Clear only this application's status
      setUpdateStatuses((prev) => ({
        ...prev,
        [applicationId]: "",
      }));

      fetchJobApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    if (applications && id) {
      applications.forEach((item: Application) => {
        if (item.job_id.toString() === id) setApplied(true);
      });
    }
  }, [applications, id]);

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recruiter_id) {
      fetchJobApplications();
    }
  }, [user, job]);

  return (
    <div className="min-h-screen bg-secondary/30">
      {loading ? (
        <Loading />
      ) : (
        <>
          {job && (
            <div className="max-w-5xl mx-auto px-5 py-8">
              <Button
                variant={"ghost"}
                className="mb-6 gap-2"
                onClick={() => router.back()}
              >
                <ArrowRight size={18} /> Back to jobs
              </Button>
              <Card className="overflow-hidden shadow-lg border-2 mb-6">
                <div className="bg-blue-600 p-8 border-b">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 ">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${job.is_active ? "bg-red-100 dark:bg-green-900/30 text-green-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}
                        >
                          {job.is_active ? "Open" : "Closed"}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                        {job.title}
                      </h1>
                      <div className="flex items-center gap-2 text-base opacity-70 mb-2 text-white">
                        <Building2 size={18} />
                        <span>Company name</span>
                      </div>
                    </div>
                    {user && user.role === "jobseeker" && (
                      <div className="shrink-0 ">
                        {applied ? (
                          <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 font-medium">
                            <CheckCircle2 size={20} /> Already applied
                          </div>
                        ) : (
                          <>
                            {job.is_active && (
                              <Button
                                onClick={() => applyJobHandler(job.job_id)}
                                disabled={btnLoading}
                                className="gap-2 h-12 px-8"
                              >
                                <Briefcase size={18} />
                                {btnLoading ? "Applying..." : "Easy apply"}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* details */}
                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-background">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <MapPin size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium mb-1">
                          Location
                        </p>
                        <p className="font-semibold">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-background">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <DollarSign size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium mb-1">
                          Salary
                        </p>
                        <p className="font-semibold">৳ {job.salary} P.M</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-background">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium mb-1">
                          Openings
                        </p>
                        <p className="font-semibold">
                          {job.openings} positions
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* job description */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Briefcase size={24} className="text-blue-600" />
                      Job description
                    </h2>
                    <div className="p-6 rounded-lg bg-secondary border">
                      <p className="text-base leading-relaxed whitespace-pre-line">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
      {user && job && user.user_id === job.posted_by_recruiter_id && (
        <div className="w-[90%] md:w-2/3 container mx-auto mt-8 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-bold">All applications</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-status" className="text-sm font-medium">
                Filter:
              </Label>

              <Select
                value={filterStatus}
                onValueChange={(e) => setFilterStatus(e)}
              >
                <SelectTrigger className="w-full pl-10 h-11 border-2 border-gray-300 rounded-md bg-transparent">
                  <SelectValue placeholder="Select your choice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {jobApplications && jobApplications.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    className="p-4 rounded-lg border-2 bg-background"
                    key={application.application_id}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          application.status === "Hired"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : application.status === "Rejected"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <div className="flex gap-3 mb-3">
                      <Link
                        target="_blank"
                        href={application.resume}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View resume
                      </Link>
                      <Link
                        target="_blank"
                        href={`/account/${application.applicant_id}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View profile
                      </Link>
                    </div>

                    {/* Update status - FIXED with isolated state */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Select
                        value={updateStatuses[application.application_id] || ""}
                        onValueChange={(newValue) =>
                          setUpdateStatuses((prev) => ({
                            ...prev,
                            [application.application_id]: newValue,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full h-11 border-2 border-gray-300 rounded-md bg-transparent">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Hired">Hired</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={btnLoading}
                        onClick={() =>
                          updateApplicationHandler(application.application_id)
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredApplications.length === 0 && (
                <p className="text-center py-8 opacity-70">
                  No application with status {filterStatus}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-center py-8 opacity-70">No application yet</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobPage;
