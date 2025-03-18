'use client';

import { useState } from 'react';
import { SearchParams } from '@/types/jobs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Clock, Briefcase, Building2, DollarSign } from 'lucide-react';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchParams>({
    keyword: '',
    location: '',
    dateSincePosted: 'any',
    jobType: 'all',
    remoteFilter: 'all',
    salary: 'any',
    experienceLevel: 'all',
    sortBy: 'relevant',
    limit: 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  const handleSelectChange = (name: keyof SearchParams, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Keywords */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Job title, keywords, or company"
                name="keyword"
                value={formData.keyword}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Remote Filter */}
          <div>
            <Select
              value={formData.remoteFilter}
              onValueChange={(value) => handleSelectChange('remoteFilter', value)}
            >
              <SelectTrigger>
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Work type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Posted */}
          <div>
            <Select
              value={formData.dateSincePosted}
              onValueChange={(value) => handleSelectChange('dateSincePosted', value)}
            >
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date posted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="24hr">Past 24 hours</SelectItem>
                <SelectItem value="past week">Past week</SelectItem>
                <SelectItem value="past month">Past month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Type */}
          <div>
            <Select
              value={formData.jobType}
              onValueChange={(value) => handleSelectChange('jobType', value)}
            >
              <SelectTrigger>
                <Briefcase className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => handleSelectChange('experienceLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="entry level">Entry level</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salary */}
          <div>
            <Select
              value={formData.salary}
              onValueChange={(value) => handleSelectChange('salary', value)}
            >
              <SelectTrigger>
                <DollarSign className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Salary range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any salary</SelectItem>
                <SelectItem value="40000">$40,000+</SelectItem>
                <SelectItem value="60000">$60,000+</SelectItem>
                <SelectItem value="80000">$80,000+</SelectItem>
                <SelectItem value="100000">$100,000+</SelectItem>
                <SelectItem value="120000">$120,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Search Jobs
          </Button>
        </div>
      </form>
    </Card>
  );
}
