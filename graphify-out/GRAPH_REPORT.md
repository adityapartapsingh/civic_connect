# Graph Report - civic connect  (2026-11-18)

## Corpus Check
- 211 files · ~306,543 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 118 file(s) not represented in the graph (top: .ttf 54, .csv 37, .xml 10)

## Summary
- 1950 nodes · 4320 edges · 134 communities (86 shown, 48 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 206 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `020a3a14`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- core.py
- VolunteerApplicationSerializer
- design_system.py
- UserManager
- get_db
- preview.py
- App.tsx
- PublicUpdateAPIView
- wards/views.py
- react
- react
- compilerOptions
- package.json
- notifications/views.py
- dependencies
- devDependencies
- manifest.json
- compilerOptions
- vite.config.ts
- scripts
- index.ts
- vercel.json
- preview.py
- IssueMap.tsx
- authentication.py
- services.py
- Key Architecture & Features
- whatsapp.py
- GamificationManager
- JWTBearerAuthentication
- django_apps
- tokens.py
- search_stack
- validate_indian_phone
- test_design_system_mode.py
- mongo.py
- search
- UserTests
- detect_domain
- RewardsPage.tsx
- reports/views.py
- ReportAPITests
- react
- validate_data.py
- BM25
- notifications/views.py
- users/views.py
- ExampleInstrumentedTest.java
- _normalize
- pipeline.py
- Anti-AI-Slop Skill
- WhatsAppBridge
- UI/UX Pro Max - Design Intelligence
- useAuthStore
- _style_is_dark_primary
- React Composition Patterns
- CatalogRefreshTest
- Endpoints
- DesignSystemGenerator
- read_rows
- com.getcapacitor.BridgeActivity
- capacitor.config.ts
- Pre-Delivery Checklist (canonical — the only one)
- Quick Reference
- test_data_contracts.py
- otp.py
- FraudPipelineTests
- test_text_layout_resilience.py
- test_data_contracts.py
- civic_connect/urls.py
- Implementing Designs
- React Composition Patterns
- canvas-design/SKILL.md
- run_report_verification_pipeline
- React Composition Patterns
- React Native (Expo)
- How to Apply These Skills in CivicConnect
- implementing.md
- Styling: Nativewind
- write_preview_html
- CivicUserPrincipal
- Frontend Design
- Designing with Sleek
- _filter_anti_patterns_for_mode
- TestThresholdGate
- test_skill_script_paths.py
- manage.py
- CatalogSummaryLineEndingsTest
- format_ascii_box
- test_rtl_support.py
- Sections
- Core Mandate
- Styling: StyleSheet
- TestStackFlagWithDesignSystem
- test_relevance_evaluator.py
- Projects
- Styling: Uniwind
- architecture-avoid-boolean-props.md
- architecture-compound-components.md
- patterns-children-over-render-props.md
- patterns-explicit-variants.md
- react19-no-forwardref.md
- state-context-interface.md
- state-decouple-implementation.md
- state-lift-state.md
- _template.md
- Ponytail Help
- .create_report
- Ponytail Anti-Overengineering Rule
- ponytail-audit/SKILL.md
- Ponytail Gain
- ponytail-review/SKILL.md
- Ponytail
- ponytail-debt/SKILL.md

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 61 edges
2. `search()` - 54 edges
3. `get_collection()` - 51 edges
4. `UserProfileSerializer` - 41 edges
5. `serialize_doc()` - 40 edges
6. `react` - 39 edges
7. `DesignSystemGenerator` - 38 edges
8. `ReportManager` - 38 edges
9. `useAuthStore` - 37 edges
10. `search_stack()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .agents/skills/ui-ux-pro-max/references/pro-rules.md → frontend/src/components/common/Button.tsx
- `TestLightResultOutputCoherence` --uses--> `DesignSystemGenerator`  [INFERRED]
  .agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py → .agents/skills/ui-ux-pro-max/scripts/design_system.py
- `JWTBearerAuthentication` --uses--> `UserManager`  [INFERRED]
  backend/civic_connect/authentication.py → backend/users/models.py
- `AdminProvisionAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRevokeAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py

## Import Cycles
- None detected.

## Communities (134 total, 48 thin omitted)

### Community 0 - "core.py"
Cohesion: 0.10
Nodes (16): _contains_phrase(), _domain_keywords(), _exact_stack_identifier(), _file_signature(), _get_bm25(), _load_csv(), _load_csv_snapshot(), _load_product_keywords() (+8 more)

### Community 1 - "VolunteerApplicationSerializer"
Cohesion: 0.28
Nodes (3): VolunteerApplicationSerializer, VolunteerApplicationAPIView, VolunteerApplicationsAdminAPIView

### Community 2 - "design_system.py"
Cohesion: 0.13
Nodes (7): _detect_page_type(), format_master_md(), format_page_override_md(), _generate_intelligent_overrides(), persist_design_system(), safe_slug(), format_output()

### Community 3 - "UserManager"
Cohesion: 0.08
Nodes (4): parse_object_id(), serialize_doc(), normalize_phone(), UserManager

### Community 4 - "get_db"
Cohesion: 0.11
Nodes (7): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), ReportsConfig

### Community 5 - "preview.py"
Cohesion: 0.07
Nodes (11): generate_design_system(), TestPersistence, _parse(), _run_search(), _TagCollector, TestPreviewCli, TestPreviewContrast, TestPreviewDarkMode (+3 more)

### Community 6 - "App.tsx"
Cohesion: 0.13
Nodes (17): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+9 more)

### Community 7 - "PublicUpdateAPIView"
Cohesion: 0.14
Nodes (5): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, record_token_usage(), GenerateActionTokenAPIView, PublicUpdateAPIView

### Community 8 - "wards/views.py"
Cohesion: 0.09
Nodes (9): WardManager, DepartmentSerializer, WardCreateSerializer, WardLeaderboardSerializer, WardSerializer, WardTests, DepartmentListAPIView, WardLeaderboardAPIView (+1 more)

### Community 9 - "react"
Cohesion: 0.19
Nodes (22): Button(), ButtonProps, Modal(), ModalProps, StatusBadge(), PhotoGeoTag, StatusUpdater(), StatusUpdaterProps (+14 more)

### Community 10 - "react"
Cohesion: 0.18
Nodes (13): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, TicketList(), TicketListProps (+5 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (24): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+16 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.10
Nodes (9): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView (+1 more)

### Community 14 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, axios, canvas-confetti, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core (+12 more)

### Community 15 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/leaflet, @types/node, @types/react (+5 more)

### Community 16 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, categories, description, display, icons, name, orientation, short_name (+2 more)

### Community 17 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 18 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 19 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, cap:build, cap:open, cap:run, cap:sync, dev, preview (+2 more)

### Community 20 - "index.ts"
Cohesion: 0.08
Nodes (40): StatusBadgeProps, Leaderboard(), MUNICIPAL_WARDS, TASK_SPECIALTIES, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, TASK_OPTIONS, adaptBackendReportToIssue() (+32 more)

### Community 33 - "preview.py"
Cohesion: 0.20
Nodes (12): _button_outline_text_color(), _contrast_ratio(), _attr(), _css_color(), _css_font(), format_preview_html(), _format_ratio(), _google_fonts_href() (+4 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.18
Nodes (17): HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps, RecenterMap() (+9 more)

### Community 35 - "authentication.py"
Cohesion: 0.11
Nodes (8): _b64url_decode(), _b64url_encode(), _get_signing_key(), IsSuperAdmin, IsWardAdminOrSuperAdmin, verify_jwt(), analyze_issue_image_data(), get_gemini_api_key()

### Community 36 - "services.py"
Cohesion: 0.10
Nodes (6): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "whatsapp.py"
Cohesion: 0.24
Nodes (6): clean_indian_phone(), get_whatsapp_gateway_base_url(), get_whatsapp_gateway_status(), reset_whatsapp_gateway_session(), send_whatsapp_message(), send_whatsapp_otp()

### Community 39 - "GamificationManager"
Cohesion: 0.16
Nodes (3): serialize_docs(), GamificationManager, GamificationTests

### Community 41 - "django_apps"
Cohesion: 0.12
Nodes (5): FraudConfig, GamificationConfig, NotificationsConfig, UsersConfig, WardsConfig

### Community 42 - "tokens.py"
Cohesion: 0.21
Nodes (4): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 43 - "search_stack"
Cohesion: 0.09
Nodes (7): _project_row(), search_stack(), _valid_max_results(), _rows(), TestNativeDesktopStackFreshness, _rows(), TestWebStackFreshness

### Community 44 - "validate_indian_phone"
Cohesion: 0.10
Nodes (4): OTPManager, validate_indian_phone(), validate_password_strength(), SendOTPAPIView

### Community 45 - "test_design_system_mode.py"
Cohesion: 0.14
Nodes (6): _derive_dark_palette(), _palette_is_dark(), _relative_luminance(), _select_palette_for_mode(), TestLuminance, TestPaletteSelection

### Community 46 - "mongo.py"
Cohesion: 0.11
Nodes (4): evaluate_user_badges(), ActionPoints, VolunteerScheme, check_password_strength()

### Community 47 - "search"
Cohesion: 0.08
Nodes (7): _normalize_rtl_level(), search(), _style_search_destination(), TestSearchDomains, TestImeGuidance, RtlFilterTest, TestStyleTaxonomy

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.09
Nodes (25): badgeIcons, DEFAULT_CIVIC_BADGES, CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState() (+17 more)

### Community 51 - "reports/views.py"
Cohesion: 0.06
Nodes (30): IsAuthenticatedCivicUser, IsOfficerOrAdmin, PriorityLevel, ReportManager, ReportStatus, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer (+22 more)

### Community 53 - "react"
Cohesion: 0.21
Nodes (15): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, getSupportedMimeType(), useCamera() (+7 more)

### Community 54 - "validate_data.py"
Cohesion: 0.13
Nodes (30): _catalog_date(), _check_app_interface_contract(), _check_catalog_contract(), _check_catalog_summary(), _check_color_contract(), _check_core_data_contract(), _check_file(), _check_font_catalog() (+22 more)

### Community 55 - "BM25"
Cohesion: 0.12
Nodes (5): BM25, _suggest_identities(), TestBm25CoreBehavior, TestDiagnosticsContracts, TestTokenizer

### Community 56 - "notifications/views.py"
Cohesion: 0.12
Nodes (3): configure_cloudinary(), delete_media(), is_cloudinary_configured()

### Community 57 - "users/views.py"
Cohesion: 0.08
Nodes (25): BadgeTier, UserRole, UserProfileSerializer, UserSyncSerializer, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView, AdminRosterAPIView (+17 more)

### Community 59 - "_normalize"
Cohesion: 0.13
Nodes (8): _exact_match_diagnostic(), _exact_row_identity(), _legacy_successor_guidance(), _normalize(), _row_identities(), _stack_query_requests_legacy(), _stack_row_filter(), _style_identity()

### Community 61 - "pipeline.py"
Cohesion: 0.16
Nodes (4): get_gemini_api_key(), verify_hazard_content(), calculate_shannon_entropy(), detect_gibberish_or_meaningless()

### Community 62 - "Anti-AI-Slop Skill"
Cohesion: 0.11
Nodes (18): Aesthetic directions (pick one, don't blend), Anti-AI-Slop Skill, Asset, Data & Code Slop, Copy defaults to refuse, Copy rules (this is half the battle), Motion & Interaction Slop, Output format when generating UI, State coverage (the fastest non-slop signal) (+10 more)

### Community 64 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.11
Nodes (17): Before Delivering App UI, Example Workflow, If a search returns 0 results, Output Formats, Query Contract, Rule Categories by Priority, Running the search tool, Step 1: Analyze User Requirements (+9 more)

### Community 65 - "useAuthStore"
Cohesion: 0.11
Nodes (27): Toast(), PointsBadge(), Layout(), MobileNav(), ConfirmResolutionPage(), MUNICIPAL_WARDS, SuperAdminPortalPage(), CIVIC_INTEREST_AREAS (+19 more)

### Community 66 - "_style_is_dark_primary"
Cohesion: 0.21
Nodes (4): _query_wants_dark(), _resolve_color_mode(), _style_is_dark_primary(), TestModeResolution

### Community 68 - "React Composition Patterns"
Cohesion: 0.12
Nodes (16): 1.1 Avoid Boolean Prop Proliferation, 1.2 Use Compound Components, 1. Component Architecture, 2.1 Decouple State Management from UI, 2.2 Define Generic Context Interfaces for Dependency Injection, 2.3 Lift State into Provider Components, 2. State Management, 3.1 Create Explicit Component Variants (+8 more)

### Community 70 - "Endpoints"
Cohesion: 0.14
Nodes (14): Chat: Cancel Run, Chat: Poll Run Status, Chat: Send Message, Components, Device: Poll, Device: Start, Endpoints, Get component (+6 more)

### Community 71 - "DesignSystemGenerator"
Cohesion: 0.09
Nodes (5): DesignSystemGenerator, _resolve_dial(), TestReasoningMatch, TestReasoningContract, TestEndToEndCoherence

### Community 72 - "read_rows"
Cohesion: 0.14
Nodes (12): read_rows(), TestAccessibilityGuidance, TestChartsTypographyAndIcons, TestCurrentReactGuidance, TestSemanticColors, _check_chart_contract(), _check_typography_contract(), _configured_font_names() (+4 more)

### Community 81 - "Pre-Delivery Checklist (canonical — the only one)"
Cohesion: 0.15
Nodes (12): Accessibility, Common Rules for Professional UI + Pre-Delivery Checklist, Icons & Visual Elements, Interaction, Interaction (App), Layout, Layout & Spacing, Light/Dark Mode (+4 more)

### Community 82 - "Quick Reference"
Cohesion: 0.15
Nodes (12): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+4 more)

### Community 83 - "test_data_contracts.py"
Cohesion: 0.12
Nodes (7): read_rows(), split_values(), style_identities(), TestGeneratedCatalogContract, TestLandingAndStackContract, TestStyleIdentityContract, read_rows()

### Community 84 - "otp.py"
Cohesion: 0.14
Nodes (4): get_collection(), hash_otp(), generate_ticket_id(), is_valid_ticket_id()

### Community 86 - "test_text_layout_resilience.py"
Cohesion: 0.20
Nodes (3): read_rows(), TestTextLayoutDataContracts, TestTextLayoutRetrieval

### Community 87 - "test_data_contracts.py"
Cohesion: 0.19
Nodes (5): apply_decision_rules(), _object_without_duplicates(), parse_decision_rules(), _validate_action(), _check_reasoning_contract()

### Community 89 - "Implementing Designs"
Cohesion: 0.18
Nodes (11): Definition of done, Design tokens, Fetching the right code, Fonts, HTML prototypes, Icons, Implementing Designs, Native frameworks (+3 more)

### Community 90 - "React Composition Patterns"
Cohesion: 0.18
Nodes (10): 1. Component Architecture (HIGH), 2. State Management (MEDIUM), 3. Implementation Patterns (MEDIUM), 4. React 19 APIs (MEDIUM), Full Compiled Document, How to Use, Quick Reference, React Composition Patterns (+2 more)

### Community 91 - "canvas-design/SKILL.md"
Cohesion: 0.20
Nodes (9): CANVAS CREATION, DEDUCING THE SUBTLE REFERENCE, DESIGN PHILOSOPHY CREATION, ESSENTIAL PRINCIPLES, FINAL STEP, HOW TO GENERATE A VISUAL PHILOSOPHY, MULTI-PAGE OPTION, PHILOSOPHY EXAMPLES (+1 more)

### Community 92 - "run_report_verification_pipeline"
Cohesion: 0.22
Nodes (4): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), run_report_verification_pipeline(), VerificationResult

### Community 93 - "React Composition Patterns"
Cohesion: 0.20
Nodes (9): Component Architecture (CRITICAL), Core Principles, Creating a New Rule, Impact Levels, Implementation Patterns (MEDIUM), React Composition Patterns, Rules, State Management (HIGH) (+1 more)

### Community 94 - "React Native (Expo)"
Cohesion: 0.22
Nodes (9): Build the feature, not the mockup, Flex direction, Gradients and hover, Infer the route tree first, Insets, Keyboard, React Native (Expo), Shadows (+1 more)

### Community 95 - "How to Apply These Skills in CivicConnect"
Cohesion: 0.22
Nodes (8): 1. Vercel Composition Patterns, 2. Frontend Design & Anti-AI Slop, 3. UI/UX Pro Max & Mobile-First Best Practices, 4. Sleek Mobile Design, CivicConnect Agent Skills & Design Intelligence, How to Apply These Skills in CivicConnect, Installation & Re-sync Commands, Installed Skills

### Community 96 - "implementing.md"
Cohesion: 0.36
Nodes (4): 1. Create a project, 2. Send a chat message, 3. Show the results, Designing

### Community 97 - "Styling: Nativewind"
Cohesion: 0.25
Nodes (7): Check the installed major first, Configuration, Styling: Nativewind, Tailwind v4 → v3, for the constructs Sleek emits, Third-party components, Tokens, Units

### Community 98 - "write_preview_html"
Cohesion: 0.25
Nodes (3): _write_persisted_file(), preview_destination(), write_preview_html()

### Community 100 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground your designs in the subject matter, More on writing in design, Process: plan, review against the brief, build, critique, Restraint and self-critique

### Community 101 - "Designing with Sleek"
Cohesion: 0.29
Nodes (7): Designing or implementing, Designing with Sleek, Error Shapes, Overview, Prerequisites: API Key, Quick Reference: All Endpoints, User shot and review shot

### Community 104 - "test_skill_script_paths.py"
Cohesion: 0.38
Nodes (3): resolve(), shipped_invocations(), SkillScriptPathsTest

### Community 108 - "format_ascii_box"
Cohesion: 0.13
Nodes (9): ansi_ljust(), format_ascii_box(), add_wrapped(), wrap_text(), format_markdown(), hex_to_ansi(), _mode_support_labels(), section_header() (+1 more)

### Community 109 - "test_rtl_support.py"
Cohesion: 0.22
Nodes (3): read_rows(), RtlCliTest, RtlDataContractTest

### Community 110 - "Sections"
Cohesion: 0.33
Nodes (5): 1. Component Architecture (architecture), 2. State Management (state), 3. Implementation Patterns (patterns), 4. React 19 APIs (react19), Sections

### Community 111 - "Core Mandate"
Cohesion: 0.40
Nodes (4): Anti-AI-Slop Frontend & UI Rule, Core Mandate, Output Protocol Before Generating Any Frontend Code, Refusal Checklist

### Community 112 - "Styling: StyleSheet"
Cohesion: 0.40
Nodes (4): Colors, Composition, Styling: StyleSheet, Units

### Community 116 - "Projects"
Cohesion: 0.50
Nodes (4): Create project, Get / Delete project, List projects, Projects

### Community 117 - "Styling: Uniwind"
Cohesion: 0.50
Nodes (3): Styling: Uniwind, Theme, Third-party components

### Community 134 - "Ponytail Help"
Cohesion: 0.22
Nodes (8): Band (Claude Code), Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 135 - ".create_report"
Cohesion: 0.10
Nodes (11): is_mock_mode(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+3 more)

### Community 138 - "Ponytail Anti-Overengineering Rule"
Cohesion: 0.40
Nodes (4): Ponytail Anti-Overengineering Rule, Principles & Boundaries, Response Style, The Smallest Complete Change Ladder

### Community 139 - "ponytail-audit/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Map first, 2. Look for, 3. Check before you report, 4. Output

### Community 140 - "Ponytail Gain"
Cohesion: 0.40
Nodes (4): Boundaries, Honesty boundary, Ponytail Gain, Scoreboard

### Community 141 - "ponytail-review/SKILL.md"
Cohesion: 0.40
Nodes (4): 1. Understand first, 2. Look for, 3. Check before you report, 4. Output

### Community 142 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

### Community 143 - "ponytail-debt/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 855 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DesignSystemGenerator` connect `DesignSystemGenerator` to `design_system.py`, `preview.py`, `format_ascii_box`, `test_design_system_mode.py`, `test_data_contracts.py`, `BM25`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `UserManager` (e.g. with `JWTBearerAuthentication` and `merge_duplicate_into_timeline()`) actually correct?**
  _`UserManager` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `core.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09879032258064516 - nodes in this community are weakly interconnected._
- **Why does `search()` connect `search` to `core.py`, `design_system.py`, `DesignSystemGenerator`, `read_rows`, `search_stack`, `test_rtl_support.py`, `detect_domain`, `test_data_contracts.py`, `test_text_layout_resilience.py`, `BM25`, `_normalize`, `pathlib`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `design_system.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._