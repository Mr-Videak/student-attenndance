
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Class } from '@/utils/data';
import { Calendar, Users } from 'lucide-react';

interface ClassCardProps {
  classData: Class;
}

const ClassCard = ({ classData }: ClassCardProps) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{classData.name}</span>
        </CardTitle>
        <CardDescription>
          Section {classData.section} | Batch {classData.batch}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm flex flex-col space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {classData.students.length} students
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Link to={`/class/${classData.id}`}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          <Link to={`/attendance/${classData.id}`}>
            <Button className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Attendance
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClassCard;
