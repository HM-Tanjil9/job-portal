"use client";
import { job_service, useAppData } from "@/context/AppContext";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  Eye,
  FileText,
  Globe,
  Image,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company as CompanyType } from "@/type";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Company = () => {
  const { loading } = useAppData();
  const addRef = useRef<HTMLButtonElement | null>(null);
  const openDialog = () => {
    addRef.current?.click();
  };
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyType[]>([]);

  const token = Cookies.get("token");

  const [companyLoading, setCompanyLoading] = useState(true);

  async function fetchCompanies() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/company/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompanies(data);
    } catch (error) {
      console.log(error);
    } finally {
      setCompanyLoading(false);
    }
  }

  async function addCompanyHandler() {
    if (!name || !description || !website || !logo) {
      return alert("Please provide all details");
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("website", website);
    formData.append("file", logo);
    try {
      setBtnLoading(true);
      const { data } = await axios.post(
        `${job_service}/api/job/company/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      clearData();
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function deleteCompany(companyId: string) {
    if (confirm("Are you sure to delete this company")) {
      try {
        setBtnLoading(true);
        const { data } = await axios.delete(
          `${job_service}/api/job/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success(data.message);
        fetchCompanies();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setBtnLoading(false);
      }
    }
  }

  const clearData = () => {
    setName("");
    setDescription("");
    setWebsite("");
    setLogo(null);
  };
  useEffect(() => {
    fetchCompanies();
  }, []);
  if (loading) return <Loading />;
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Card className="shadow-lg border-2 overflow-hidden">
        <div className="bg-blue-500 p-6 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">My Companies</CardTitle>
            <CardDescription className="text-sm mt-1 text-white">
              Manage your registered companies ({companies.length}/3)
            </CardDescription>
            {companies.length < 3 && (
              <Button onClick={openDialog} className="gap-2">
                <Plus size={18} />
                Add Company
              </Button>
            )}
          </div>
        </div>
        {companyLoading ? (
          <div className="flex items-center justify-center text-gray-600">
            Please wait...
          </div>
        ) : (
          <div className="p-6">
            {companies?.length > 0 ? (
              <div className="grid gap-4">
                {companies.map((c: CompanyType) => (
                  <div
                    key={c.company_id}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-blue-500 transition-all bg-background"
                  >
                    <div className="h-16 w-16 rounded-full border-2 overflow-hidden shrink-0  bg-background">
                      <img
                        src={c.logo}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* company info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {c.name}
                      </h3>
                      <p className="text-sm opacity-70 line-clamp-2 mb-2">
                        {c.description}
                      </p>
                      <a
                        href={c.website_url}
                        target="_blank"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
                        {c.website_url}
                      </a>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/company/${c.company_id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => deleteCompany(c.company_id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Building2 size={32} className="opacity-40" />
                  </div>
                  <CardDescription className="text-base mb-4">
                    No companies registered yet
                  </CardDescription>
                  <p className="text-sm opacity-60">
                    Add your first company to start posting jobs and managing
                    applications.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
      {/* Dialog for creating a new company */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="hidden" ref={addRef}></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Building2 size={24} className="text-blue-600" />
              Add new company
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Briefcase size={16} /> Company Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter company name"
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium flex items-center gap-2"
              >
                <FileText size={16} /> Description
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter company description"
                className="h-11"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="website"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Globe size={16} /> Website url
              </Label>
              <Input
                id="website"
                type="text"
                placeholder="https://www.example.com/"
                className="h-11"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="logo"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Image size={16} /> Company logo
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="h-11 cursor-pointer"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLogo(e.target.files?.[0] || null)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={btnLoading}
              className="w-full h-11"
              onClick={addCompanyHandler}
            >
              {btnLoading ? "Adding company..." : "Add company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
