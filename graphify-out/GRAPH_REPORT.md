# Graph Report - civic connect  (2026-11-16)

## Corpus Check
- 138 files · ~104,998 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1123 nodes · 2807 edges · 77 communities (39 shown, 38 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0708e067`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OTPManager
- UserProfileSerializer
- validate_indian_phone
- UserManager
- get_db
- WardTests
- App.tsx
- tokens.py
- wards/views.py
- useAuthStore
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
- get_collection
- IssueMap.tsx
- authentication.py
- services.py
- Key Architecture & Features
- ReportAPITests
- reports/models.py
- CivicUserPrincipal
- ReportManager
- reports/serializers.py
- verify_location_integrity
- gamification/views.py
- rest_framework
- users/models.py
- duplicates.py
- UserTests
- run_report_verification_pipeline
- RewardsPage.tsx
- reports/views.py
- ProfilePage.tsx
- react
- ai_vision.py
- civic_connect/urls.py
- analyze_report_fraud
- users/views.py
- ExampleInstrumentedTest.java
- _require_super_admin
- main.tsx
- os
- WardManager
- WhatsAppBridge
- run_report_verification_pipeline
- LoginPage.tsx
- cloudinary_service.py
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 58 edges
2. `get_collection()` - 48 edges
3. `UserProfileSerializer` - 41 edges
4. `react` - 39 edges
5. `ReportManager` - 38 edges
6. `useAuthStore` - 37 edges
7. `serialize_doc()` - 36 edges
8. `lucide-react` - 31 edges
9. `useToastStore` - 30 edges
10. `UserTests` - 28 edges

## Surprising Connections (you probably didn't know these)
- `AdminProvisionAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRevokeAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRosterAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `UserProfileAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationReviewAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py

## Import Cycles
- None detected.

## Communities (77 total, 38 thin omitted)

### Community 2 - "validate_indian_phone"
Cohesion: 0.09
Nodes (8): BadgeTier, UserSyncSerializer, VolunteerApplicationSerializer, check_password_strength(), is_valid_indian_phone(), normalize_phone_number(), validate_indian_phone(), validate_password_strength()

### Community 4 - "get_db"
Cohesion: 0.06
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 6 - "App.tsx"
Cohesion: 0.15
Nodes (15): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+7 more)

### Community 7 - "tokens.py"
Cohesion: 0.21
Nodes (4): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 8 - "wards/views.py"
Cohesion: 0.20
Nodes (6): DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "useAuthStore"
Cohesion: 0.19
Nodes (24): Button(), ButtonProps, StatusBadge(), PhotoGeoTag, StatusUpdater(), StatusUpdaterProps, AdminPortalPage(), ConfirmResolutionPage() (+16 more)

### Community 10 - "react"
Cohesion: 0.17
Nodes (15): FilterBar(), FilterBarProps, LoadingSpinnerProps, Pagination(), PaginationProps, Toast(), TicketList(), TicketListProps (+7 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (24): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+16 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.16
Nodes (5): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, record_token_usage(), GenerateActionTokenAPIView, PublicUpdateAPIView

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
Nodes (43): StatusBadgeProps, Leaderboard(), MUNICIPAL_WARDS, TASK_SPECIALTIES, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, TASK_OPTIONS, CIVIC_INTEREST_AREAS (+35 more)

### Community 33 - "get_collection"
Cohesion: 0.12
Nodes (4): get_collection(), hash_otp(), generate_ticket_id(), is_valid_ticket_id()

### Community 34 - "IssueMap.tsx"
Cohesion: 0.17
Nodes (20): CardSkeleton(), HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+12 more)

### Community 35 - "authentication.py"
Cohesion: 0.15
Nodes (6): _b64url_decode(), _b64url_encode(), _get_signing_key(), IsSuperAdmin, IsWardAdminOrSuperAdmin, verify_jwt()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 39 - "reports/models.py"
Cohesion: 0.13
Nodes (9): is_mock_mode(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+1 more)

### Community 41 - "ReportManager"
Cohesion: 0.11
Nodes (3): parse_object_id(), serialize_doc(), ReportManager

### Community 42 - "reports/serializers.py"
Cohesion: 0.22
Nodes (6): PriorityLevel, ReportStatus, EvidenceEntrySerializer, ReportMapPinSerializer, StatusHistoryEntrySerializer, MapReportsAPIView

### Community 43 - "verify_location_integrity"
Cohesion: 0.15
Nodes (3): compute_image_phash(), hamming_distance(), FraudPipelineTests

### Community 44 - "gamification/views.py"
Cohesion: 0.18
Nodes (6): BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 45 - "rest_framework"
Cohesion: 0.21
Nodes (3): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView

### Community 46 - "users/models.py"
Cohesion: 0.12
Nodes (4): evaluate_user_badges(), GamificationManager, GamificationTests, VolunteerScheme

### Community 47 - "duplicates.py"
Cohesion: 0.19
Nodes (4): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), ActionPoints, calculate_priority_score()

### Community 49 - "run_report_verification_pipeline"
Cohesion: 0.22
Nodes (4): IsAuthenticatedCivicUser, serialize_docs(), ReportCreateSerializer, ReportListCreateAPIView

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.13
Nodes (16): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+8 more)

### Community 51 - "reports/views.py"
Cohesion: 0.16
Nodes (14): ReportConfirmSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer, ReportUpvoteCreateSerializer, FeedReportsAPIView, NearbyReportsAPIView, ReportAnalyzeImageAPIView (+6 more)

### Community 52 - "ProfilePage.tsx"
Cohesion: 0.19
Nodes (12): Modal(), ModalProps, badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), CategoryInfo, getWardsForDistrict(), INDIAN_STATES (+4 more)

### Community 53 - "react"
Cohesion: 0.15
Nodes (20): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, NearbyCheck(), NearbyCheckProps, CapturedMedia (+12 more)

### Community 56 - "analyze_report_fraud"
Cohesion: 0.17
Nodes (3): verify_location_integrity(), find_duplicate_reports(), analyze_report_fraud()

### Community 57 - "users/views.py"
Cohesion: 0.09
Nodes (23): UserRole, UserProfileSerializer, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView (+15 more)

### Community 61 - "os"
Cohesion: 0.06
Nodes (12): build.sh script, get_gemini_api_key(), verify_hazard_content(), calculate_shannon_entropy(), detect_gibberish_or_meaningless(), main(), clean_indian_phone(), get_whatsapp_gateway_base_url() (+4 more)

### Community 65 - "LoginPage.tsx"
Cohesion: 0.24
Nodes (7): LoginPage(), MUNICIPAL_WARDS, authApi, COMMON_WEAK_PASSWORDS, PasswordStrengthResult, PhoneValidationResult, validateIndianPhone()

### Community 66 - "cloudinary_service.py"
Cohesion: 0.12
Nodes (7): IsOfficerOrAdmin, ReportStatusUpdateSerializer, ReportStatusUpdateAPIView, configure_cloudinary(), delete_media(), is_cloudinary_configured(), upload_media()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 504 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `UserManager` to `OTPManager`, `UserProfileSerializer`, `authentication.py`, `reports/models.py`, `ReportManager`, `users/models.py`, `duplicates.py`, `UserTests`, `run_report_verification_pipeline`, `reports/views.py`, `users/views.py`, `_require_super_admin`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `validate_indian_phone` be split into smaller, more focused modules?**
  _Cohesion score 0.0896551724137931 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `UserProfileSerializer`, `validate_indian_phone`, `UserManager`, `get_db`, `services.py`, `.get_leaderboard`, `tokens.py`, `reports/models.py`, `ReportManager`, `reports/serializers.py`, `notifications/views.py`, `users/models.py`, `duplicates.py`, `run_report_verification_pipeline`, `reports/views.py`, `analyze_report_fraud`, `users/views.py`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `UserManager` be split into smaller, more focused modules?**
  _Cohesion score 0.10726950354609929 - nodes in this community are weakly interconnected._