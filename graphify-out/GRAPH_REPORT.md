# Graph Report - civic connect  (2026-11-05)

## Corpus Check
- 138 files · ~93,852 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1091 nodes · 2663 edges · 79 communities (37 shown, 42 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 130 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a284978`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.tsx
- ReportManager
- tokens.py
- parse_object_id
- rest_framework
- typing
- whatsapp.py
- rest_framework
- RewardsPage.tsx
- get_db
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
- TicketPage.tsx
- IssueMap.tsx
- authentication.py
- get_collection
- Key Architecture & Features
- fraud/views.py
- reports/models.py
- ReportAPITests
- react
- useAuthStore
- validators.py
- gamification/views.py
- llm_verifier.py
- GamificationManager
- UserProfileSerializer
- .upsert_user
- JWTBearerAuthentication
- re
- reports/views.py
- ReportPage.tsx
- pipeline.py
- ProfilePage.tsx
- OTPManager
- .record_points
- UserManager
- ExampleInstrumentedTest.java
- IsSuperAdmin
- App.tsx
- IsAuthenticatedCivicUser
- LoginPage.tsx
- WhatsAppBridge
- CivicUserPrincipal
- os
- IsOfficerOrAdmin
- manage.py
- IsWardAdminOrSuperAdmin
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `get_collection()` - 48 edges
2. `UserManager` - 47 edges
3. `react` - 39 edges
4. `ReportManager` - 37 edges
5. `useAuthStore` - 37 edges
6. `serialize_doc()` - 33 edges
7. `UserProfileSerializer` - 33 edges
8. `lucide-react` - 31 edges
9. `useToastStore` - 28 edges
10. `UserTests` - 26 edges

## Surprising Connections (you probably didn't know these)
- `AdminProvisionAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRevokeAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationReviewAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationsAdminAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `merge_duplicate_into_timeline()` --uses--> `ActionPoints`  [INFERRED]
  backend/fraud/duplicates.py → backend/gamification/models.py

## Import Cycles
- None detected.

## Communities (79 total, 42 thin omitted)

### Community 3 - "tokens.py"
Cohesion: 0.18
Nodes (5): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token(), ReportStatus

### Community 6 - "typing"
Cohesion: 0.08
Nodes (7): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud(), FraudPipelineTests

### Community 7 - "whatsapp.py"
Cohesion: 0.24
Nodes (6): clean_indian_phone(), get_whatsapp_gateway_base_url(), get_whatsapp_gateway_status(), reset_whatsapp_gateway_session(), send_whatsapp_message(), send_whatsapp_otp()

### Community 8 - "rest_framework"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "RewardsPage.tsx"
Cohesion: 0.13
Nodes (16): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+8 more)

### Community 10 - "get_db"
Cohesion: 0.06
Nodes (14): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), is_mongo_connected(), _migrate_sparse_to_partial(), HealthCheckAPIView (+6 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.13
Nodes (4): PublicUpdateStatusSerializer, record_token_usage(), GenerateActionTokenAPIView, PublicUpdateAPIView

### Community 14 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, axios, canvas-confetti, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core (+13 more)

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
Cohesion: 0.25
Nodes (8): scripts, build, cap:build, cap:open, cap:run, cap:sync, dev, preview

### Community 20 - "index.ts"
Cohesion: 0.09
Nodes (34): Leaderboard(), MUNICIPAL_WARDS, TASK_SPECIALTIES, MUNICIPAL_WARDS, CIVIC_INTEREST_AREAS, MUNICIPAL_WARDS, VOLUNTEER_SCHEMES, adaptBackendReportToIssue() (+26 more)

### Community 33 - "TicketPage.tsx"
Cohesion: 0.20
Nodes (19): Button(), ButtonProps, StatusBadge(), StatusBadgeProps, PhotoGeoTag, StatusUpdater(), StatusUpdaterProps, NearbyCheck() (+11 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.15
Nodes (19): TicketListProps, HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+11 more)

### Community 35 - "authentication.py"
Cohesion: 0.20
Nodes (5): _b64url_decode(), _b64url_encode(), generate_jwt(), _get_signing_key(), verify_jwt()

### Community 36 - "get_collection"
Cohesion: 0.18
Nodes (3): get_collection(), generate_ticket_id(), is_valid_ticket_id()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "fraud/views.py"
Cohesion: 0.22
Nodes (3): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView

### Community 39 - "reports/models.py"
Cohesion: 0.11
Nodes (10): is_mock_mode(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+2 more)

### Community 41 - "react"
Cohesion: 0.22
Nodes (14): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Modal(), ModalProps, Pagination(), PaginationProps (+6 more)

### Community 42 - "useAuthStore"
Cohesion: 0.21
Nodes (16): Toast(), PointsBadge(), Layout(), MobileNav(), AdminPortalPage(), ConfirmResolutionPage(), SuperAdminPortalPage(), VolunteersPage() (+8 more)

### Community 43 - "validators.py"
Cohesion: 0.25
Nodes (3): check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 44 - "gamification/views.py"
Cohesion: 0.18
Nodes (6): BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 46 - "GamificationManager"
Cohesion: 0.10
Nodes (5): serialize_docs(), evaluate_user_badges(), ActionPoints, GamificationManager, VolunteerScheme

### Community 47 - "UserProfileSerializer"
Cohesion: 0.12
Nodes (5): BadgeTier, UserProfileSerializer, UserSyncSerializer, validate_indian_phone(), validate_password_strength()

### Community 49 - "JWTBearerAuthentication"
Cohesion: 0.13
Nodes (5): JWTBearerAuthentication, VolunteerApplicationSerializer, WhatsAppAdminResetAPIView, WhatsAppAdminStatusAPIView, WhatsAppAdminTestAPIView

### Community 51 - "reports/views.py"
Cohesion: 0.06
Nodes (27): PriorityLevel, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer, ReportMapPinSerializer (+19 more)

### Community 52 - "ReportPage.tsx"
Cohesion: 0.20
Nodes (15): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, useCamera(), useNearbyReports() (+7 more)

### Community 53 - "pipeline.py"
Cohesion: 0.15
Nodes (5): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), run_report_verification_pipeline(), VerificationResult, calculate_priority_score()

### Community 54 - "ProfilePage.tsx"
Cohesion: 0.21
Nodes (11): badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), CategoryInfo, CATEGORIES, getWardsForDistrict(), INDIAN_STATES, JALANDHAR_WARDS (+3 more)

### Community 57 - "UserManager"
Cohesion: 0.13
Nodes (18): UserManager, UserRole, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView (+10 more)

### Community 60 - "App.tsx"
Cohesion: 0.14
Nodes (16): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+8 more)

### Community 62 - "LoginPage.tsx"
Cohesion: 0.22
Nodes (7): MUNICIPAL_WARDS, adminApi, authApi, COMMON_WEAK_PASSWORDS, PasswordStrengthResult, PhoneValidationResult, validateIndianPhone()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 501 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `UserManager` to `.get_collection`, `ReportManager`, `authentication.py`, `parse_object_id`, `rest_framework`, `reports/models.py`, `GamificationManager`, `.upsert_user`, `JWTBearerAuthentication`, `pipeline.py`, `.record_points`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `rest_framework` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `ReportManager`, `tokens.py`, `parse_object_id`, `rest_framework`, `typing`, `reports/models.py`, `ReportAPITests`, `get_db`, `notifications/views.py`, `GamificationManager`, `UserProfileSerializer`, `.upsert_user`, `JWTBearerAuthentication`, `reports/views.py`, `pipeline.py`, `UserManager`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `ReportManager` (e.g. with `run_report_verification_pipeline()` and `ActionTokenTests`) actually correct?**
  _`ReportManager` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `typing` be split into smaller, more focused modules?**
  _Cohesion score 0.0797979797979798 - nodes in this community are weakly interconnected._