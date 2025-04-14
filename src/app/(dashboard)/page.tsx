import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { prisma } from '@/lib/prisma';
import { Users, Briefcase, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard - MyHRBuddy',
  description: 'MyHRBuddy ATS Dashboard',
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}


const StatsCard = ({ title, value, icon }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);


async function getBasicStats() {
  // Get basic counts
  const applicantCount = await prisma.applicant.count();
  const applicationCount = await prisma.application.count();
  const positionCount = await prisma.position.count();
  
  // Get 5 most recent applicants
  const recentApplicants = await prisma.applicant.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      applications: {
        include: {
          position: true,
        },
        take: 1,
      },
      skills: {
        include: {
          skill: true,
        },
        take: 3,
      },
    },
  });

  return {
    applicantCount,
    applicationCount,
    positionCount,
    recentApplicants,
  };
}

export default async function DashboardPage() {
  const { applicantCount, applicationCount, positionCount, recentApplicants } = await getBasicStats();

  const getInitials = (firstName: string, lastName: string | null = null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatsCard 
          title="Total Applicants" 
          value={applicantCount} 
          icon={<Users className="h-4 w-4" />} 
        />
        
        <StatsCard 
          title="Total Applications" 
          value={applicationCount} 
          icon={<FileText className="h-4 w-4" />} 
        />
        
        <StatsCard 
          title="Open Positions" 
          value={positionCount} 
          icon={<Briefcase className="h-4 w-4" />} 
        />
      </div>
      
      {/* Recent Applicants */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Applicants</CardTitle>
          <CardDescription>
            Latest candidates in your hiring pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplicants.length === 0 ? (
            <p className="text-muted-foreground">No applicants yet</p>
          ) : (
            <div className="space-y-4">
              {recentApplicants.map((applicant) => (
                <div key={applicant.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(applicant.firstName, applicant.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/applicants/${applicant.id}`} className="font-medium hover:underline text-primary">
                        {applicant.firstName} {applicant.lastName}
                      </Link>
                      <p className="text-sm text-muted-foreground">{applicant.email}</p>
                      {applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {applicant.skills.map((skill) => (
                            <Badge key={skill.skillId} variant="secondary" className="text-xs">
                              {skill.skill.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(applicant.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 text-center">
                <Button asChild variant="outline" size="sm">
                  <Link href="/applicants">View All Applicants</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-4 mt-8">
        <Button asChild>
          <Link href="/search">Search Applicants</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/applicants/new">Add Applicant</Link>
        </Button>
      </div>
    </div>
  );
}
