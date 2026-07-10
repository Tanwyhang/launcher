"use client";

import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import InsightsIcon from "@mui/icons-material/Insights";
import PublicIcon from "@mui/icons-material/Public";
import { Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";
import { Admin, Layout, Resource } from "react-admin";
import { adminDataProvider } from "@/components/admin/data-provider";
import { PageEdit, PageList } from "@/components/admin/page-resource";

function Dashboard() {
  return (
    <Stack spacing={3} sx={{ p: 1 }}>
      <div>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          SEO Page Operator
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Manage one winning multilingual affiliate template now, then replicate it safely across markets and use cases.
        </Typography>
      </div>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardHeader avatar={<AutoStoriesIcon />} title="Template-first" />
          <CardContent>
            First rollout is designed as a repeatable best-X-for-Y-in-Z page, not a generic blog post.
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardHeader avatar={<PublicIcon />} title="Locale URLs" />
          <CardContent>
            Each locale keeps its own public slug while staying editable side-by-side in one admin record.
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardHeader avatar={<InsightsIcon />} title="Commercial slots" />
          <CardContent>
            Offers are managed as explicit winner slots with score, price band, best-for angle, and localized CTAs.
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}

function AdminLayout(props: any) {
  return <Layout {...props} sx={{ "& .RaLayout-content": { backgroundColor: "#f1f5f9" } }} />;
}

export default function AdminApp() {
  return (
    <Admin dataProvider={adminDataProvider} dashboard={Dashboard} layout={AdminLayout}>
      <Resource name="pages" list={PageList} edit={PageEdit} recordRepresentation="slug" />
    </Admin>
  );
}
