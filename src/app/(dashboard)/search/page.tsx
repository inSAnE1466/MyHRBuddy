"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">AI Search</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Natural Language Search</CardTitle>
          <CardDescription>
            Search for applicants using natural language queries powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSearch}>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="e.g., 'Find React developers with 3+ years of experience'"
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Try queries like:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Find frontend developers with React experience</li>
                <li>Show me applicants who applied in the last month</li>
                <li>List candidates with machine learning skills who applied for data science positions</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {searchResults 
              ? `Found ${searchResults.length} applicant(s) matching your query`
              : 'Enter a search query above to see results'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {!searchResults && !error && (
            <div className="text-center py-8 text-muted-foreground">
              Enter a search query above to see results
            </div>
          )}
          
          {searchResults && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No applicants found matching your query
            </div>
          )}
          
          {searchResults && searchResults.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Applied For</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(applicant.firstName, applicant.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            <a href={`/applicants/${applicant.id}`} className="hover:underline text-primary">
                              {applicant.firstName} {applicant.lastName}
                            </a>
                          </div>
                          <div className="text-xs text-muted-foreground">{applicant.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {applicant.applications.map((app: any) => (
                          <Badge key={app.id} variant="outline" className="text-xs">
                            {app.position.title}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.slice(0, 3).map((skill: any) => (
                          <Badge key={skill.skillId} variant="secondary" className="text-xs">
                            {skill.skill.name}
                          </Badge>
                        ))}
                        {applicant.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{applicant.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-xs">
                        {applicant.matchScore ? `${Math.round(applicant.matchScore * 100)}%` : 'Match'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}