# Graph Report - civic connect  (2026-11-04)

## Corpus Check
- 136 files · ~91,125 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 2)

## Summary
- 1054 nodes · 2564 edges · 85 communities (36 shown, 49 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6214b029`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- users/views.py
- ReportManager
- tokens.py
- UserManager
- reports/models.py
- typing
- serialize_docs
- rest_framework
- RewardsPage.tsx
- django_apps
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
- react
- IssueMap.tsx
- authentication.py
- ticket_id.py
- Key Architecture & Features
- mongo.py
- HomePage.tsx
- llm_verifier.py
- useAuthStore
- useToastStore
- JWTBearerAuthentication
- ReportAPITests
- reports/serializers.py
- GamificationManager
- OTPManager
- .upsert_user
- ErrorBoundary
- detect_gibberish_or_meaningless
- reports/urls.py
- ProfilePage.tsx
- reports/views.py
- cloudinary_service.py
- verify_location_integrity
- .post
- upload_media
- ExampleInstrumentedTest.java
- validate_password_strength
- parse_object_id
- WardTests
- manage.py
- WhatsAppBridge
- main.tsx
- CivicUserPrincipal
- IsAuthenticatedCivicUser
- IsOfficerOrAdmin
- IsSuperAdmin
- IsWardAdminOrSuperAdmin
- otp.py
- com.getcapacitor.BridgeActivity
- capacitor.config.ts
- ReportDisputeAPIView

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

## Communities (85 total, 49 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.14
Nodes (20): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+12 more)

### Community 1 - "users/views.py"
Cohesion: 0.11
Nodes (16): UserRole, UserProfileSerializer, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView (+8 more)

### Community 3 - "tokens.py"
Cohesion: 0.22
Nodes (4): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 5 - "reports/models.py"
Cohesion: 0.12
Nodes (10): is_mock_mode(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+2 more)

### Community 7 - "serialize_docs"
Cohesion: 0.29
Nodes (3): serialize_docs(), ReportCreateSerializer, ReportListCreateAPIView

### Community 8 - "rest_framework"
Cohesion: 0.06
Nodes (12): is_mongo_connected(), HealthCheckAPIView, FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, WardManager, DepartmentSerializer, WardLeaderboardSerializer (+4 more)

### Community 9 - "RewardsPage.tsx"
Cohesion: 0.13
Nodes (16): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+8 more)

### Community 10 - "django_apps"
Cohesion: 0.07
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.13
Nodes (6): get_collection(), ActionTokenResponseSerializer, PublicUpdateStatusSerializer, record_token_usage(), GenerateActionTokenAPIView, PublicUpdateAPIView

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
Cohesion: 0.12
Nodes (26): adaptBackendReportToIssue(), adaptUserProfile(), adaptWardLeaderboardItem(), backendPriorityToFrontend(), backendStatusToFrontend(), frontendPriorityToBackend(), frontendStatusToBackend(), getCategorySlaHours() (+18 more)

### Community 33 - "react"
Cohesion: 0.22
Nodes (14): CameraCapture(), CameraCaptureProps, CategoryPicker(), NearbyCheck(), NearbyCheckProps, CapturedMedia, useCamera(), NearbyIssueItem (+6 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.16
Nodes (18): TicketListProps, HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+10 more)

### Community 35 - "authentication.py"
Cohesion: 0.23
Nodes (5): _b64url_decode(), _b64url_encode(), generate_jwt(), _get_signing_key(), verify_jwt()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "mongo.py"
Cohesion: 0.10
Nodes (4): ActionPoints, BadgeTier, VolunteerScheme, UserSyncSerializer

### Community 39 - "HomePage.tsx"
Cohesion: 0.24
Nodes (11): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, StatusBadgeProps, HomePage() (+3 more)

### Community 41 - "useAuthStore"
Cohesion: 0.21
Nodes (18): Button(), ButtonProps, Modal(), ModalProps, StatusBadge(), PhotoGeoTag, StatusUpdater(), StatusUpdaterProps (+10 more)

### Community 42 - "useToastStore"
Cohesion: 0.15
Nodes (24): ProtectedRouteProps, Toast(), Leaderboard(), PointsBadge(), Layout(), MobileNav(), AdminPortalPage(), MUNICIPAL_WARDS (+16 more)

### Community 45 - "reports/serializers.py"
Cohesion: 0.22
Nodes (7): PriorityLevel, ReportStatus, EvidenceEntrySerializer, ReportMapPinSerializer, ReportStatusUpdateSerializer, StatusHistoryEntrySerializer, MapReportsAPIView

### Community 46 - "GamificationManager"
Cohesion: 0.09
Nodes (9): evaluate_user_badges(), GamificationManager, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationTests, GamificationLeaderboardAPIView (+1 more)

### Community 49 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 51 - "reports/urls.py"
Cohesion: 0.14
Nodes (10): ReportConfirmSerializer, ReportDetailSerializer, ReportUpvoteCreateSerializer, FeedReportsAPIView, NearbyReportsAPIView, ReportConfirmAPIView, ReportDetailAPIView, ReportStatusUpdateAPIView (+2 more)

### Community 52 - "ProfilePage.tsx"
Cohesion: 0.15
Nodes (16): CategoryPickerProps, iconMap, badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), AIAnalysisResult, VALID_CATEGORIES, CategoryInfo (+8 more)

### Community 53 - "reports/views.py"
Cohesion: 0.11
Nodes (6): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), run_report_verification_pipeline()

### Community 54 - "cloudinary_service.py"
Cohesion: 0.21
Nodes (3): configure_cloudinary(), delete_media(), is_cloudinary_configured()

### Community 55 - "verify_location_integrity"
Cohesion: 0.13
Nodes (3): verify_location_integrity(), analyze_report_fraud(), FraudPipelineTests

### Community 57 - "upload_media"
Cohesion: 0.28
Nodes (3): ReportEvidenceCreateSerializer, ReportEvidenceAPIView, upload_media()

### Community 59 - "validate_password_strength"
Cohesion: 0.18
Nodes (4): check_password_strength(), is_valid_indian_phone(), normalize_phone_number(), validate_password_strength()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 485 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_collection()` connect `notifications/views.py` to `users/views.py`, `ReportManager`, `tokens.py`, `ticket_id.py`, `reports/models.py`, `mongo.py`, `typing`, `serialize_docs`, `otp.py`, `django_apps`, `JWTBearerAuthentication`, `ReportAPITests`, `GamificationManager`, `.upsert_user`, `reports/views.py`, `verify_location_integrity`, `.post`, `parse_object_id`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
- **Why does `ReportManager` connect `ReportManager` to `tokens.py`, `UserManager`, `reports/models.py`, `mongo.py`, `typing`, `serialize_docs`, `reports/serializers.py`, `GamificationManager`, `.upsert_user`, `ReportDisputeAPIView`, `reports/urls.py`, `reports/views.py`, `upload_media`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `ReportManager` (e.g. with `run_report_verification_pipeline()` and `ActionTokenTests`) actually correct?**
  _`ReportManager` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `users/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11282051282051282 - nodes in this community are weakly interconnected._