import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Applicants - MyHRBuddy',
  description: 'View and manage all applicants',
};

async function getApplicants() {
  return prisma.applicant.findMany({
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
      },
    },
  });
}

export default async function ApplicantsPage() {
  const applicants = await getApplicants();
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Applicants</h1>
        
        <div className="flex space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Advanced Search
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
          <CardDescription>
            A list of all applicants in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No applicants found
                  </TableCell>
                </TableRow>
              ) : (
                applicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {getInitials(applicant.firstName, applicant.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <Link href={`/applicants/${applicant.id}`} className="font-medium hover:underline text-primary">
                          {applicant.firstName} {applicant.lastName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{applicant.email}</TableCell>
                    <TableCell>{applicant.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {applicant.applications.map(app => (
                          <Badge key={app.id} variant="outline" className="text-xs">
                            {app.position.title}
                          </Badge>
                        ))}
                        {applicant.applications.length === 0 && (
                          <span className="text-xs text-muted-foreground">No applications</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.slice(0, 3).map(skill => (
                          <Badge key={skill.skillId} variant="secondary" className="text-xs">
                            {skill.skill.name}
                          </Badge>
                        ))}
                        {applicant.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{applicant.skills.length - 3}
                          </Badge>
                        )}
                        {applicant.skills.length === 0 && (
                          <span className="text-xs text-muted-foreground">No skills</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(applicant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="icon">
                        <Link href={`/applicants/${applicant.id}`}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}