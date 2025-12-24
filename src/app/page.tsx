import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, FileAudio, MessageSquare, Calendar, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Easily manage your roster of students with profiles, instruments, and skill levels.",
  },
  {
    icon: FileAudio,
    title: "Audio & Video Submissions",
    description: "Students submit practice recordings directly. No more email attachments or file sharing hassles.",
  },
  {
    icon: MessageSquare,
    title: "Instant Feedback",
    description: "Provide detailed feedback on recordings with ratings. Students see your comments immediately.",
  },
  {
    icon: Calendar,
    title: "Assignment Tracking",
    description: "Create assignments with due dates and track completion status across all your students.",
  },
  {
    icon: Music,
    title: "Practice Logging",
    description: "Students log their practice sessions. See who's practicing and who needs encouragement.",
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description: "Get an overview of student activity, pending reviews, and practice trends at a glance.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MusicLMS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Teaching Music,{" "}
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The all-in-one platform for music teachers. Manage students, assign practice,
            collect recordings, and give feedback — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See Features
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Free for up to 5 students. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Replace your spreadsheets, email threads, and file sharing apps with one
              purpose-built platform for music education.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sign up and invite your students</h3>
                <p className="text-muted-foreground">
                  Create your teacher account and send invite links to your students.
                  They&apos;ll set up their profiles with instrument and skill level.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create and assign practice</h3>
                <p className="text-muted-foreground">
                  Build assignments with descriptions, reference materials, and due dates.
                  Assign to one student or your entire studio at once.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Review and give feedback</h3>
                <p className="text-muted-foreground">
                  Students submit recordings of their practice. Listen, watch, and provide
                  detailed feedback with ratings. Track progress over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you grow.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>Up to 5 students</li>
                  <li>Unlimited assignments</li>
                  <li>Audio & video submissions</li>
                  <li>Practice logging</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold">$19<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <CardDescription>For growing studios</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>Unlimited students</li>
                  <li>Everything in Free</li>
                  <li>Priority support</li>
                  <li>Advanced analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your teaching?</h2>
          <p className="text-muted-foreground mb-8">
            Join music teachers who are spending less time on admin and more time on what matters — teaching.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <span className="font-semibold">MusicLMS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MusicLMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
