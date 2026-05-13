import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  FileText,
  Monitor,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  ShieldCheck,
  Clock,
  BarChart3,
  UserPlus,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import useStore from "@/state";
import api from "@/lib/axios";

const AdminDashboard = () => {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");

  const orgId =
    typeof user?.organization === "string"
      ? user?.organization
      : (user?.organization as any)?._id || (user?.organization as any)?.$oid;

  // Fetch members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["admin-members", orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/members`);
      return res.data.data;
    },
    enabled: !!orgId,
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics", orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}/analytics`);
      return res.data.data;
    },
    enabled: !!orgId,
  });

  // Approve mutation
  const { mutate: approveMember, isPending: approving } = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/organizations/${orgId}/members/${userId}/approve`);
    },
    onSuccess: () => {
      toast.success("Member approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to approve member.");
    },
  });

  // Deny mutation
  const { mutate: denyMember, isPending: denying } = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/organizations/${orgId}/members/${userId}/deny`);
    },
    onSuccess: () => {
      toast.success("Member denied and removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to deny member.");
    },
  });

  // Invite mutation
  const { mutate: inviteMember, isPending: inviting } = useMutation({
    mutationFn: async (email: string) => {
      await api.post(`/organizations/${orgId}/invite`, { email });
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      setInviteEmail("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to send invitation.");
    },
  });

  const pendingMembers =
    membersData?.filter((m: any) => m.membershipStatus === "pending") || [];
  const approvedMembers =
    membersData?.filter((m: any) => m.membershipStatus === "approved") || [];

  const statCards = [
    {
      title: "Total Members",
      value: analyticsData?.totalMembers ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Students",
      value: analyticsData?.totalStudents ?? "—",
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "PBTs Graded",
      value: analyticsData?.pbtGraded ?? "—",
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "CBTs Graded",
      value: analyticsData?.cbtGraded ?? "—",
      icon: Monitor,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Exams",
      value: analyticsData?.totalExams ?? "—",
      icon: BarChart3,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Total Graded",
      value: analyticsData?.totalGraded ?? "—",
      icon: ShieldCheck,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-700">Access Restricted</h2>
          <p className="text-slate-500">Only organization admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-500">
            Manage your institution's members, invitations, and usage analytics.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-none shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div
                className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {analyticsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs text-slate-500 font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 gap-2 h-12 inline-flex">
          <TabsTrigger
            value="pending"
            className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingMembers.length})
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Members ({approvedMembers.length})
          </TabsTrigger>
          <TabsTrigger
            value="invite"
            className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Usage
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent
          value="pending"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card>
            <CardHeader>
              <CardTitle>Pending Membership Requests</CardTitle>
              <CardDescription>
                Users who have requested to join your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : pendingMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    No pending requests
                  </p>
                  <p className="text-slate-400 text-sm">
                    New join requests will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMembers.map((member: any) => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">
                          {member.first_name} {member.last_name}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {member.email}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                          }).format(new Date(member.createdAt))}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={approving || denying}
                            onClick={() => approveMember(member._id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={approving || denying}
                            onClick={() => denyMember(member._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent
          value="members"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card>
            <CardHeader>
              <CardTitle>Approved Members</CardTitle>
              <CardDescription>
                Active members of your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : approvedMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    No approved members yet
                  </p>
                  <p className="text-slate-400 text-sm">
                    Invite teachers or approve pending requests.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedMembers.map((member: any) => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">
                          {member.first_name} {member.last_name}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              member.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {member.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Intl.DateTimeFormat("en-US", {
                            dateStyle: "medium",
                          }).format(new Date(member.createdAt))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Tab */}
        <TabsContent
          value="invite"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card>
            <CardHeader>
              <CardTitle>Invite a Teacher</CardTitle>
              <CardDescription>
                Send an invitation email with your organization code to a new
                teacher.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Teacher's Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (!inviteEmail.trim()) {
                      toast.error("Please enter an email address.");
                      return;
                    }
                    inviteMember(inviteEmail);
                  }}
                  disabled={inviting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-600">
                  <strong>How it works:</strong> The teacher will receive an
                  email with a link to sign up on GradrAI. Your organization
                  code will be pre-filled. Once they complete registration, their
                  request will appear in the Pending tab for your approval.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent
          value="usage"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card>
            <CardHeader>
              <CardTitle>Usage per Member</CardTitle>
              <CardDescription>
                Grading activity and resource usage across your institution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : !analyticsData?.perUserUsage?.length ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    No usage data yet
                  </p>
                  <p className="text-slate-400 text-sm">
                    Usage statistics will appear as members start grading.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Courses</TableHead>
                      <TableHead className="text-center">
                        Exams Created
                      </TableHead>
                      <TableHead className="text-center">
                        Results Graded
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.perUserUsage.map((u: any) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              u.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {u.coursesCount}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {u.examsCreated}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {u.resultsGraded}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
