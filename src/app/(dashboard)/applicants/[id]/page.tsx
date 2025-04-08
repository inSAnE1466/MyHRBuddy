import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Applicant Details - MyHRBuddy',
  description: 'View applicant details',
};

async function getApplicant(id: string) {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            position: true,
            files: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!applicant) {
      return null;
    }

    return applicant;
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return null;
  }
}

export default async function ApplicantDetailsPage({ params }: { params: { id: string } }) {
  const applicant = await getApplicant(params.id);
  
  if (!applicant) {
    notFound();
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/applicants" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Applicants
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profile</CardTitle>
              <CardDescription>Applicant's basic information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-xl">
                  {getInitials(applicant.firstName, applicant.lastName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{applicant.firstName} {applicant.lastName}</h2>
              <p className="text-muted-foreground">{applicant.email}</p>
              {applicant.phone && <p className="text-muted-foreground">{applicant.phone}</p>}
              <div className="mt-4 w-full">
                {applicant.applications.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Applied For</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {applicant.applications.map((app) => (
                        <Badge key={app.id} variant="outline">
                          {app.position.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle>Skills</CardTitle>
              <CardDescription>Applicant's skills and expertise</CardDescription>
            </CardHeader>
            <CardContent>
              {applicant.skills.length === 0 ? (
                <p className="text-muted-foreground text-center">No skills listed</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill) => (
                    <Badge key={skill.skillId} variant="secondary">
                      {skill.skill.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle>Applications</CardTitle>
              <CardDescription>Details of applicant's job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applicant.applications.length === 0 ? (
                <p className="text-muted-foreground text-center">No applications found</p>
              ) : (
                <div className="space-y-4">
                  {applicant.applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{app.position.title}</h3>
                        <Badge variant={
                          app.status === 'PENDING' ? 'warning' :
                          app.status === 'REVIEWING' ? 'info' :
                          app.status === 'ACCEPTED' ? 'success' :
                          'outline'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 flex-wrap mt-4">
                        {app.files.map((file) => (
                          <Button key={file.id} variant="outline" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              View {file.type}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Notes & Analysis</CardTitle>
              <CardDescription>AI-generated insights and notes</CardDescription>
            </CardHeader>
            <CardContent>
              {applicant.aiAnalysis ? (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: applicant.aiAnalysis }} />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">No AI analysis available yet</p>
                  <Button variant="outline" size="sm">
                    Generate Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}