import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';


interface ApplicantPageParams {
  params: {
    id: string;
  };
}


// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const applicant = await prisma.applicant.findUnique({
    where: { id: params.id },
  });

  if (!applicant) {
    return {
      title: 'Applicant Not Found - MyHRBuddy',
    };
  }

  return {
    title: `${applicant.firstName} ${applicant.lastName} - MyHRBuddy`,
  };
}

async function getApplicantData(id: string) {
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          position: true,
          files: true,
          aiAnalyses: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          stages: {
            orderBy: {
              changedAt: 'desc'
            }
          }
        }
      },
      skills: {
        include: {
          skill: true
        }
      }
    }
  });

  return applicant;
}

export default async function ApplicantPage({ params }: ApplicantPageParams) {
  const applicant = await getApplicantData(params.id);

  if (!applicant) {
    notFound();
  }

  // Get the most recent application and its data
  const latestApplication = applicant.applications[0];
  const resumeAnalysis = latestApplication?.aiAnalyses[0];
  const currentStage = latestApplication?.stages[0]?.stage || 'New';
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/applicants">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applicants
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {applicant.firstName} {applicant.lastName}
          </h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span>{applicant.email}</span>
          </div>
          {applicant.phone && (
            <div className="flex items-center mt-1 text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              <span>{applicant.phone}</span>
            </div>
          )}
          {applicant.location && (
            <div className="flex items-center mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{applicant.location}</span>
            </div>
          )}
        </div>
        
        <Badge className="text-sm">
          {currentStage}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              {latestApplication ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Position</h3>
                    <p>{latestApplication.position.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Applied On</h3>
                    <p>{new Date(latestApplication.appliedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {applicant.availableToStart && (
                    <div>
                      <h3 className="font-medium">Available to Start</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(applicant.availableToStart).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {applicant.excitementReason && (
                    <div>
                      <h3 className="font-medium">Why Excited About This Role</h3>
                      <p>{applicant.excitementReason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>No application data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resume" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              {latestApplication?.files.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>{latestApplication.files[0].fileName}</span>
                    
                    <Button asChild variant="outline" size="sm" className="ml-4">
                      <a href={latestApplication.files[0].storagePath} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </Button>
                  </div>
                  
                  {resumeAnalysis && (
                    <div className="mt-8">
                      <h3 className="font-medium mb-3">AI Analysis</h3>
                      <div className="prose max-w-none">
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                          {JSON.stringify(resumeAnalysis.analysisResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>No resume uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill) => (
                    <Badge key={skill.skillId} variant="secondary" className="px-3 py-1">
                      {skill.skill.name}
                      {skill.yearsExperience && ` (${skill.yearsExperience} years)`}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No skills information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex space-x-4">
        <Button>Move to Next Stage</Button>
        <Button variant="outline">Send Email</Button>
      </div>
    </div>
  );
}
