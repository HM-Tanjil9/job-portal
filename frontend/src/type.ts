import React, { ReactNode } from "react";

export interface JobOptions {
  title: string;
  responsibilities: string;
  why: string;
}
export interface SkillsToLearn {
  title: string;
  why: string;
  how: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillsToLearn[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}
export interface CarrierGuideResponse {
  summary: string;
  jobOptions: JobOptions[];
  skillsToLearn: SkillCategory[];
  learningApproach: LearningApproach;
}

export interface ScoreBreakdown {
  formatting: {
    score: number;
    feedback: string;
  };
  keywords: {
    score: number;
    feedback: string;
  };
  structure: {
    score: number;
    feedback: string;
  };
  readability: {
    score: number;
    feedback: string;
  };
}

export interface Suggestions {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface ResumeAnalysisResponse {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  suggestions: Suggestions[];
  strengths: string[];
  summary: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profile_pic: string | null;
  profile_pic_public_id: string | null;
  skills: string[];
  subscription: Date | string | null;
}

export interface AppContextType {
  loading: boolean;
  user: User | null;
  btnLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  updateProfilePic: (formData: any) => Promise<void>;
  updateResume: (formData: any) => Promise<void>;
}

export interface AppProviderProps {
  children: ReactNode;
}

export interface AccountProps {
  user: User | null;
  isYourAccount: boolean;
}
