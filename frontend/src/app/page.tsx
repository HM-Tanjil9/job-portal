"use client";
import CarrierGuide from "@/components/carrier-guide";
import Hero from "@/components/hero";
import Loading from "@/components/loading";
import ResumeAnalyzer from "@/components/resume-analyser";
import { useAppData } from "@/context/AppContext";
import React from "react";

function Home() {
  const { loading } = useAppData();
  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <Hero />
      <CarrierGuide />
      <ResumeAnalyzer />
    </div>
  );
}

export default Home;
