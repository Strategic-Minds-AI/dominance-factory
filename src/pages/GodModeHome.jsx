import React from "react";
import LaunchHeader from "@/components/launch/LaunchHeader";
import LaunchHero from "@/components/launch/LaunchHero";
import LaunchIndustries from "@/components/launch/LaunchIndustries";
import LaunchTemplates from "@/components/launch/LaunchTemplates";
import LaunchProcess from "@/components/launch/LaunchProcess";
import LaunchCTA from "@/components/launch/LaunchCTA";
import LaunchFooter from "@/components/launch/LaunchFooter";

export default function GodModeHome() {
  return (
    <div className="min-h-screen bg-white">
      <LaunchHeader />
      <LaunchHero />
      <LaunchIndustries />
      <LaunchTemplates />
      <LaunchProcess />
      <LaunchCTA />
      <LaunchFooter />
    </div>
  );
}