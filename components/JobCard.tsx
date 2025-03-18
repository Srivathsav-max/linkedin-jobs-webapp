import { Job } from '@/types/jobs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarDays, MapPin, Building2, DollarSign, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-start space-x-4 pb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
          <span className="text-lg font-semibold text-gray-600">
            {job.companyName ? job.companyName.charAt(0) : "?"}
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-lg leading-tight text-gray-900 line-clamp-2">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            {job.companyName}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{job.location}</span>
          </div>

          {job.salary && job.salary !== "" && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{job.salary}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{job.postedTime || "Recently posted"}</span>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {job.workType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {job.workType}
              </Badge>
            )}
            {job.contractType && (
              <Badge variant="secondary">
                {job.contractType}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button asChild className="w-full gap-2">
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Job
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
