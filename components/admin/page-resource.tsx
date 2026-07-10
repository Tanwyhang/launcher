"use client";

import {
  ArrayInput,
  BooleanInput,
  DataTable,
  Edit,
  FunctionField,
  List,
  NumberInput,
  Resource,
  SaveButton,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  Toolbar,
  useInput,
} from "react-admin";
import { Box, Card, CardContent, CardHeader, Chip, Stack, TextField, Typography } from "@mui/material";
import type { CmsBlogPost } from "@/lib/sample-data";
import { LOCALES, getLocaleByCode, getLocalePath } from "@/lib/utils";

function StringListInput({ source, label }: { source: string; label: string }) {
  const { field, fieldState } = useInput({ source, defaultValue: [] });

  return (
    <TextField
      fullWidth
      multiline
      minRows={4}
      label={label}
      value={Array.isArray(field.value) ? field.value.join("\n") : ""}
      onChange={(event) => {
        const nextValue = event.target.value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        field.onChange(nextValue);
      }}
      onBlur={field.onBlur}
      error={!!fieldState.error}
      helperText={fieldState.error?.message || "One item per line"}
    />
  );
}

function LocaleColumn({ index, label }: { index: number; label: string }) {
  const base = `translations.${index}`;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardHeader
        title={label}
        subheader="Locale-specific URL, messaging, blocks, and FAQ"
      />
      <CardContent>
        <Stack spacing={2.5}>
          <TextInput source={`${base}.locale`} sx={{ display: "none" }} />
          <TextInput source={`${base}.title`} label="Title" fullWidth />
          <TextInput source={`${base}.slug`} label="Locale URL slug" fullWidth />
          <TextInput source={`${base}.metaTitle`} label="Meta title" fullWidth />
          <TextInput
            source={`${base}.metaDescription`}
            label="Meta description"
            fullWidth
            multiline
            minRows={3}
          />
          <TextInput
            source={`${base}.quickAnswer`}
            label="Quick answer"
            fullWidth
            multiline
            minRows={4}
          />
          <TextInput source={`${base}.heroImageUrl`} label="Hero image URL" fullWidth />
          <StringListInput source={`${base}.keyTakeaways`} label="Key takeaways" />

          <ArrayInput source={`${base}.sections`} label="Sections">
            <SimpleFormIterator inline={false}>
              <TextInput source="id" sx={{ display: "none" }} />
              <TextInput source="sectionTitle" label="Section title" fullWidth />
              <TextInput source="sectionImageUrl" label="Section image URL" fullWidth />
              <TextInput
                source="sectionBody"
                label="Section body"
                fullWidth
                multiline
                minRows={4}
              />
            </SimpleFormIterator>
          </ArrayInput>

          <ArrayInput source={`${base}.faqItems`} label="FAQ items">
            <SimpleFormIterator inline={false}>
              <TextInput source="id" sx={{ display: "none" }} />
              <TextInput source="question" label="Question" fullWidth />
              <TextInput source="answer" label="Answer" fullWidth multiline minRows={3} />
            </SimpleFormIterator>
          </ArrayInput>

          <TextInput
            source={`${base}.body`}
            label="Methodology / editorial body"
            fullWidth
            multiline
            minRows={8}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function PageToolbar() {
  return (
    <Toolbar>
      <SaveButton />
    </Toolbar>
  );
}

function PageList() {
  return (
    <List perPage={25} sort={{ field: "updatedAt", order: "DESC" }}>
      <DataTable rowClick="edit">
        <DataTable.Col source="id" />
        <DataTable.Col label="Page">
          <FunctionField
            render={(record: CmsBlogPost) =>
              record.translations.find((item) => item.locale === "en")?.title || record.slug
            }
          />
        </DataTable.Col>
        <DataTable.Col label="Template">
          <FunctionField render={(record: CmsBlogPost) => record.pageConfig.templateKey} />
        </DataTable.Col>
        <DataTable.Col label="Market">
          <FunctionField render={(record: CmsBlogPost) => record.pageConfig.market} />
        </DataTable.Col>
        <DataTable.Col label="Use Case">
          <FunctionField render={(record: CmsBlogPost) => record.pageConfig.useCase} />
        </DataTable.Col>
        <DataTable.Col label="Locales">
          <FunctionField
            render={(record: CmsBlogPost) => (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {record.translations.map((item) => (
                  <Chip key={item.locale} size="small" label={`${getLocaleByCode(item.locale).pathSegment}: ${getLocalePath(item.locale, item.slug)}`} />
                ))}
              </Stack>
            )}
          />
        </DataTable.Col>
        <DataTable.Col source="status" />
      </DataTable>
    </List>
  );
}

function PageEdit() {
  return (
    <Edit mutationMode="pessimistic">
      <SimpleForm toolbar={<PageToolbar />}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Template Strategy
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            width: "100%",
          }}
        >
          <TextInput source="slug" label="Primary slug" fullWidth />
          <SelectInput
            source="status"
            label="Status"
            choices={[
              { id: "draft", name: "draft" },
              { id: "published", name: "published" },
            ]}
            fullWidth
          />
          <TextInput source="pageConfig.templateKey" label="Template key" fullWidth />
          <TextInput source="pageConfig.primaryKeyword" label="Primary keyword" fullWidth />
          <TextInput source="pageConfig.category" label="Category" fullWidth />
          <TextInput source="pageConfig.useCase" label="Use case" fullWidth />
          <TextInput source="pageConfig.market" label="Market" fullWidth />
          <TextInput
            source="pageConfig.disclosure"
            label="Disclosure"
            fullWidth
            multiline
            minRows={3}
          />
        </Box>

        <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
          Locale Columns
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", xl: "repeat(3, minmax(0, 1fr))" },
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {LOCALES.map((locale, index) => (
            <LocaleColumn key={locale.code} index={index} label={locale.label} />
          ))}
        </Box>

        <Typography variant="h5" sx={{ mt: 3, fontWeight: 700 }}>
          Offer Slots
        </Typography>
        <ArrayInput source="affiliateLinks" label="Affiliate offers">
          <SimpleFormIterator inline={false}>
            <TextInput source="id" sx={{ display: "none" }} />
            <TextInput source="merchantName" label="Merchant" fullWidth />
            <TextInput source="anchorText" label="Product / anchor" fullWidth />
            <TextInput source="bestFor" label="Best for" fullWidth />
            <TextInput source="notFor" label="Not ideal for" fullWidth />
            <TextInput source="summary" label="Summary" fullWidth multiline minRows={2} />
            <TextInput source="priceBand" label="Price band" fullWidth />
            <TextInput source="pricingSummary" label="Pricing summary" fullWidth multiline minRows={2} />
            <StringListInput source="pros" label="Pros" />
            <StringListInput source="cons" label="Cons" />
            <NumberInput source="score" label="Score" min={0} max={10} step={0.1} fullWidth />
            <TextInput source="destinationUrl" label="Destination URL" fullWidth />
            <TextInput source="trackingUrl" label="Tracking URL" fullWidth />
            <TextInput source="ctaTextEn" label="CTA (EN)" fullWidth />
            <TextInput source="ctaTextMs" label="CTA (MS)" fullWidth />
            <TextInput source="ctaTextZhHans" label="CTA (ZH)" fullWidth />
            <BooleanInput source="isActive" label="Active" />
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Edit>
  );
}

export function AdminResources() {
  return <Resource name="pages" list={PageList} edit={PageEdit} recordRepresentation="slug" />;
}
