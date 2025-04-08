import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  FileText 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard - MyHRBuddy',
  description: 'MyHRBuddy ATS Dashboard',
};

async function getStats() {
  const applicantCount = await prisma.applicant.count();
  const applicationCount = await prisma.application.count();
  const positionCount = await prisma.position.count();
  const recentApplicants = await prisma.applicant.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      applications: {
        include: {
          position: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
        take: 3,
      },
    },
  });

  const openPositions = await prisma.position.findMany({
    take: 5,
    where: { status: 'OPEN' },
    include: {
      applications: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    applicantCount,
    applicationCount,
    positionCount,
    recentApplicants,
    openPositions,
  };
}

export default async function DashboardPage() {
  const { 
    applicantCount, 
    applicationCount, 
    positionCount, 
    recentApplicants,
    openPositions
  } = await getStats();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
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
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applicants</CardTitle>
            <CardDescription>
              The most recent applicants in the system
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {applicant.skills.map((skill) => (
                            <Badge key={skill.skillId} variant="secondary" className="text-xs">
                              {skill.skill.name}
                            </Badge>
                          ))}
                        </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>
              Currently active job positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {openPositions.length === 0 ? (
              <p className="text-muted-foreground">No open positions</p>
            ) : (
              <div className="space-y-4">
                {openPositions.map((position) => (
                  <div key={position.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{position.title}</h3>
                      <Badge className="text-xs">
                        {position.applications.length} applicant{position.applications.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {position.department || 'No department specified'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Posted: {new Date(position.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}