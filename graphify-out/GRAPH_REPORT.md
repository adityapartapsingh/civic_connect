# Graph Report - civic connect  (2026-11-16)

## Corpus Check
- 142 files · ~104,938 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1123 nodes · 2841 edges · 70 communities (36 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 144 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `87762709`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserManager
- UserProfileSerializer
- validate_indian_phone
- otp.py
- get_db
- WardTests
- typing
- llm_verifier.py
- rest_framework
- ProfilePage.tsx
- react
- compilerOptions
- package.json
- get_collection
- dependencies
- devDependencies
- manifest.json
- compilerOptions
- vite.config.ts
- scripts
- index.ts
- vercel.json
- get_collection
- IssueMap.tsx
- authentication.py
- FraudPipelineTests
- Key Architecture & Features
- ReportAPITests
- typing
- CivicUserPrincipal
- ai_vision.py
- useAuthStore
- validate_coordinates
- civic_connect/urls.py
- reports/models.py
- VolunteerApplicationSerializer
- UserTests
- main.tsx
- RewardsPage.tsx
- reports/views.py
- react
- OTPManager
- UserManager
- ExampleInstrumentedTest.java
- ErrorBoundary
- App.tsx
- WhatsAppBridge
- cloudinary_service.py
- manage.py
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 58 edges
2. `get_collection()` - 48 edges
3. `useAuthStore` - 45 edges
4. `react` - 43 edges
5. `UserProfileSerializer` - 40 edges
6. `useToastStore` - 38 edges
7. `ReportManager` - 37 edges
8. `serialize_doc()` - 36 edges
9. `lucide-react` - 35 edges
10. `UserTests` - 28 edges

## Surprising Connections (you probably didn't know these)
- `merge_duplicate_into_timeline()` --uses--> `ActionPoints`  [INFERRED]
  backend/fraud/duplicates.py → backend/gamification/models.py
- `merge_duplicate_into_timeline()` --uses--> `GamificationManager`  [INFERRED]
  backend/fraud/duplicates.py → backend/gamification/models.py
- `merge_duplicate_into_timeline()` --uses--> `UserManager`  [INFERRED]
  backend/fraud/duplicates.py → backend/users/models.py
- `run_report_verification_pipeline()` --uses--> `ReportManager`  [INFERRED]
  backend/fraud/pipeline.py → backend/reports/models.py
- `ReportManager` --uses--> `ActionPoints`  [INFERRED]
  backend/reports/models.py → backend/gamification/models.py

## Import Cycles
- None detected.

## Communities (70 total, 34 thin omitted)

### Community 0 - "UserManager"
Cohesion: 0.08
Nodes (3): parse_object_id(), normalize_phone(), UserManager

### Community 1 - "UserProfileSerializer"
Cohesion: 0.18
Nodes (4): UserProfileSerializer, AdminQuickLoginAPIView, PasswordLoginAPIView, UserProfileAPIView

### Community 2 - "validate_indian_phone"
Cohesion: 0.12
Nodes (5): BadgeTier, VolunteerScheme, UserSyncSerializer, validate_indian_phone(), validate_password_strength()

### Community 4 - "get_db"
Cohesion: 0.07
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 6 - "typing"
Cohesion: 0.10
Nodes (6): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud()

### Community 7 - "llm_verifier.py"
Cohesion: 0.07
Nodes (13): get_gemini_api_key(), verify_hazard_content(), calculate_shannon_entropy(), detect_gibberish_or_meaningless(), check_password_strength(), is_valid_indian_phone(), normalize_phone_number(), clean_indian_phone() (+5 more)

### Community 8 - "rest_framework"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "ProfilePage.tsx"
Cohesion: 0.15
Nodes (15): CategoryPickerProps, iconMap, badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), AIAnalysisResult, authApi, IssueCategory (+7 more)

### Community 10 - "react"
Cohesion: 0.14
Nodes (26): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Modal(), ModalProps, Pagination(), PaginationProps (+18 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

### Community 13 - "get_collection"
Cohesion: 0.17
Nodes (4): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, GenerateActionTokenAPIView, PublicUpdateAPIView

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
Cohesion: 0.07
Nodes (46): StatusBadgeProps, Leaderboard(), MUNICIPAL_WARDS, TASK_SPECIALTIES, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, TASK_OPTIONS, CIVIC_INTEREST_AREAS (+38 more)

### Community 33 - "get_collection"
Cohesion: 0.15
Nodes (6): get_collection(), ActionTokenTests, generate_action_token(), _get_secret_key(), record_token_usage(), verify_action_token()

### Community 34 - "IssueMap.tsx"
Cohesion: 0.21
Nodes (15): TicketListProps, HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+7 more)

### Community 35 - "authentication.py"
Cohesion: 0.11
Nodes (8): _b64url_decode(), _b64url_encode(), generate_jwt(), _get_signing_key(), IsSuperAdmin, IsWardAdminOrSuperAdmin, verify_jwt(), hash_otp()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 39 - "typing"
Cohesion: 0.09
Nodes (10): is_mock_mode(), find_nearby_active_duplicate(), merge_duplicate_into_timeline(), run_report_verification_pipeline(), VerificationResult, haversine_distance(), is_near_facility(), point_to_geojson() (+2 more)

### Community 42 - "useAuthStore"
Cohesion: 0.22
Nodes (20): Toast(), PointsBadge(), CitizenLayout(), Layout(), MobileNav(), OfficerLayout(), SuperAdminLayout(), WardAdminLayout() (+12 more)

### Community 43 - "validate_coordinates"
Cohesion: 0.25
Nodes (4): build_box_query(), build_near_query(), geojson_to_coords(), validate_coordinates()

### Community 44 - "civic_connect/urls.py"
Cohesion: 0.07
Nodes (11): is_mongo_connected(), HealthCheckAPIView, FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer (+3 more)

### Community 46 - "reports/models.py"
Cohesion: 0.11
Nodes (4): evaluate_user_badges(), ActionPoints, GamificationManager, GamificationTests

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.13
Nodes (16): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+8 more)

### Community 51 - "reports/views.py"
Cohesion: 0.06
Nodes (29): IsAuthenticatedCivicUser, IsOfficerOrAdmin, serialize_doc(), serialize_docs(), PriorityLevel, ReportManager, ReportStatus, EvidenceEntrySerializer (+21 more)

### Community 52 - "react"
Cohesion: 0.23
Nodes (16): Button(), ButtonProps, CameraCapture(), CameraCaptureProps, CategoryPicker(), NearbyCheck(), NearbyCheckProps, CapturedMedia (+8 more)

### Community 55 - "OTPManager"
Cohesion: 0.19
Nodes (3): OTPManager, SendOTPAPIView, VerifyOTPAPIView

### Community 57 - "UserManager"
Cohesion: 0.10
Nodes (18): JWTBearerAuthentication, UserRole, AdminProvisionAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView, RedeemRewardAPIView (+10 more)

### Community 59 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 60 - "App.tsx"
Cohesion: 0.15
Nodes (18): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+10 more)

### Community 66 - "cloudinary_service.py"
Cohesion: 0.15
Nodes (4): configure_cloudinary(), delete_media(), is_cloudinary_configured(), upload_media()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 505 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `UserManager` to `UserProfileSerializer`, `validate_indian_phone`, `authentication.py`, `typing`, `reports/models.py`, `VolunteerApplicationSerializer`, `UserTests`, `reports/views.py`, `OTPManager`, `UserManager`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserManager` be split into smaller, more focused modules?**
  _Cohesion score 0.07909604519774012 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `UserManager`, `UserProfileSerializer`, `cloudinary_service.py`, `otp.py`, `get_db`, `authentication.py`, `typing`, `typing`, `validate_indian_phone`, `get_collection`, `reports/models.py`, `VolunteerApplicationSerializer`, `UserTests`, `reports/views.py`, `UserManager`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `validate_indian_phone` be split into smaller, more focused modules?**
  _Cohesion score 0.11857707509881422 - nodes in this community are weakly interconnected._