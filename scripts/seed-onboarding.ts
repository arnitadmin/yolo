import { db } from "../src/lib/db";

const onboardingMarkdown = `# Welcome to YOLO 🎯

## Getting Started

Welcome to **YOLO** - Your Organization's Living Overview! This is your single source of truth for all organizational applications and resources.

## What is YOLO?

YOLO is a centralized application directory that helps you:

- **Discover** all available applications in your organization
- **Search** quickly using fuzzy search
- **Filter** by categories to find what you need
- **Access** applications with a single click

## Key Features

### 🔍 Smart Search
Use the search bar to quickly find applications by name, description, or tags. Our fuzzy search ensures you find what you're looking for even with typos!

### 🏷️ Category Filtering
Browse applications by category using the filter buttons or the dock at the bottom of the page.

### 🎨 Beautiful UI
Enjoy a modern, responsive interface with dark mode support that adapts to your preferences.

### 👥 Role-Based Access
Administrators have access to additional features and applications through the admin panel.

## Navigation

- **Home** - Browse all available applications
- **Admin Panel** - Manage applications and categories (admin only)
- **Profile** - Manage your account settings

## Need Help?

If you have questions or need assistance, please contact your IT administrator.

---

*Happy exploring!* 🚀`;

async function main() {
  console.log("Seeding onboarding content...");

  const content = await db.content.upsert({
    where: { slug: "onboarding" },
    update: {
      markdown: onboardingMarkdown,
    },
    create: {
      slug: "onboarding",
      title: "Welcome to YOLO",
      markdown: onboardingMarkdown,
    },
  });

  console.log("✅ Onboarding content seeded:", content.slug);
}

main()
  .catch((e) => {
    console.error("Error seeding onboarding content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
