# CLAUDE.md

이 파일은 이 저장소의 코드 작업 시 Claude Code(claude.ai/code)를 위한 가이드를 제공합니다.

## 전체 가이드라인

- 항상 한국말을 할 것
- 존댓말을 사용할것

## 프로젝트 개요

React, TypeScript, Vite, TanStack 기반의 Shadcn 어드민 대시보드 프로젝트입니다. 대시보드 페이지, 사용자 관리, 설정 등의 어드민 UI를 제공하며, RTL(우-좌) 지원과
커스터마이징된 Shadcn 컴포넌트를 포함합니다.

## 개발 명령어

```bash
# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 타입 체크
yarn tsc -b

# 린트 검사
yarn lint

# 코드 포맷팅
yarn format

# 포맷팅 검사 (변경 없음)
yarn format:check

# 미사용 임포트/익스포트 검사
yarn knip

# 빌드 결과물 로컬에서 미리보기
yarn preview
```

## 프로젝트 구조

```
src/
├── assets/              # 아이콘 및 로고 (브랜드 아이콘, 커스텀 아이콘)
├── components/
│   ├── ui/             # Shadcn UI 컴포넌트 (일부 RTL 커스터마이징됨)
│   ├── layout/         # 레이아웃 컴포넌트 (사이드바, 헤더, 인증 레이아웃)
│   ├── data-table/     # 데이터 테이블 유틸리티 (컬럼, 필터, 페이지네이션)
│   └── [기타]          # 커스텀 컴포넌트 (테마 스위치, 검색 등)
├── context/            # React Context 제공자 (테마, 방향, 레이아웃 등)
├── features/           # 도메인별 기능 모듈 (사용자, 인증, 대시보드 등)
│   └── [도메인]/       # 각 기능의 컴포넌트, 훅, 타입 등 포함
├── hooks/              # 커스텀 React 훅
├── lib/                # 유틸리티 함수
├── routes/             # TanStack Router 라우트 정의 (파일 기반 라우팅)
├── stores/             # Zustand 상태 관리 (auth-store)
├── styles/             # 글로벌 CSS 및 Tailwind 설정
└── main.tsx           # 애플리케이션 진입점
```

## 아키텍처 및 주요 패턴

### 라우팅

- **프레임워크**: TanStack Router (파일 기반 라우팅)
- **위치**: `src/routes/`
- **구조**: 디렉토리 그룹핑으로 URL에 영향을 주지 않는 논리적 조직
    - `(auth)` - 인증 페이지 (로그인, 회원가입, 비밀번호 찾기, OTP)
    - `(errors)` - 에러 페이지 (401, 403, 404, 500, 503)
    - `_authenticated` - 인증이 필요한 보호된 라우트
- **자동 생성**: TanStack Router가 파일 구조로부터 `src/routeTree.gen.ts` 자동 생성
- **컨텍스트**: QueryClient는 라우터 컨텍스트로 전달되어 모든 라우트에서 사용 가능

### 상태 관리

- **전역 인증 상태**: Zustand 스토어 (`src/stores/auth-store.ts`)
    - 사용자 정보, 액세스 토큰 관리
    - 쿠키에 토큰 유지
    - 인증 상태 확인 및 토큰 관리에 사용
- **레이아웃 상태**: React Context (`src/context/layout-provider.tsx`)
    - 사이드바 축약 모드 및 레이아웃 변형 관리
    - 쿠키에 유지
- **UI 상태**: Context로 관리 (테마, 방향/RTL, 폰트, 검색)
- **서버 상태**: TanStack React Query
    - `src/main.tsx`에서 커스텀 에러 핸들링과 함께 설정
    - 자동 재시도 (개발: 0회, 프로덕션: 최대 3회)
    - 401/403 에러 시 즉시 인증 리셋 및 로그인 페이지로 리다이렉트
    - Stale time: 10초

### 데이터 페칭

- **HTTP 클라이언트**: Axios (커스텀 에러 핸들링 포함)
- **쿼리 설정**: TanStack React Query
    - `src/main.tsx`의 커스텀 재시도 로직
    - 401 에러 시 인증 리셋 및 리다이렉트
    - 500 에러 시 프로덕션에서 에러 페이지로 이동
    - `src/lib/handle-server-error.ts`를 통한 에러 핸들링
- **뮤테이션 에러**: `handleServerError()`로 자동 토스트 알림 표시

### 커스터마이징된 Shadcn 컴포넌트

표준 Shadcn에서 RTL 및 기타 개선을 위해 수정된 컴포넌트:

**수정된 컴포넌트** (일반적 업데이트):

- scroll-area
- sonner
- separator

**RTL 업데이트 컴포넌트** (레이아웃/위치):

- alert-dialog
- calendar
- command
- dialog
- dropdown-menu
- select
- table
- sheet
- sidebar
- switch

Shadcn CLI로 업데이트할 때는 커스터마이징을 보존하기 위해 수동으로 변경사항을 병합하세요. 다른 Shadcn 컴포넌트는 CLI로 안전하게 업데이트 가능합니다.

### Context 제공자

`src/context/`에 위치하며 애플리케이션을 감싸는 제공자들:

- **ThemeProvider**: 라이트/다크 모드 지원
- **DirectionProvider**: RTL/LTR 방향 관리
- **FontProvider**: 폰트 패밀리 선택
- **LayoutProvider**: 사이드바 및 레이아웃 구성
- **SearchProvider**: 글로벌 검색 명령 기능

## 코드 스타일 및 품질

### 린트 규칙

- **파서**: TypeScript ESLint
- **주요 규칙**:
    - `no-console`: 프로덕션에서 에러 (예외: `// eslint-disable-next-line no-console`)
    - `@typescript-eslint/consistent-type-imports`: 타입 전용 임포트 강제 (예: `import { type MyType }`)
    - `@typescript-eslint/no-unused-vars`: 미사용 변수 에러 (`_` 접두사로 무시 가능)
    - `react-refresh/only-export-components`: 비컴포넌트 익스포트에 경고
    - `no-duplicate-imports`: 같은 모듈에서 중복 임포트 방지
- **무시 경로**: `dist`, `src/components/ui` (Shadcn 컴포넌트)

### 포맷팅

- **도구**: Prettier (임포트 정렬 및 Tailwind CSS 클래스 정렬)
- **주요 설정**:
    - 2칸 들여쓰기
    - 80자 라인 너비
    - 싱글 따옴표
    - 세미콜론 없음
    - 후행 쉼표 (es5 스타일)
    - LF 줄 끝
- **플러그인**:
    - `@trivago/prettier-plugin-sort-imports`: 타입별 임포트 정렬
    - `prettier-plugin-tailwindcss`: Tailwind 클래스 정렬

### 임포트 순서

임포트가 자동으로 다음 순서로 정렬됩니다:

1. Node 모듈 (path, vite 등)
2. React 및 관련 라이브러리
3. 써드파티 라이브러리 (zod, axios, date-fns 등)
4. Radix UI 및 폼 라이브러리
5. TanStack 패키지
6. 프로젝트 별칭 (`@/assets`, `@/api`, `@/stores`, `@/lib`, `@/utils`, `@/constants`, `@/context`, `@/hooks`, `@/components`,
   `@/features`)
7. 상대 경로

### 타입 체킹

- **TypeScript**: Strict 모드 활성화
- **baseUrl**: `src`로 설정된 경로 별칭 (`@/*`)
- **빌드 체크**: `tsc -b`로 전체 프로젝트 타입 검사

## 컴포넌트 개발

### 데이터 테이블 패턴

- **위치**: `src/components/data-table/`
- **컴포넌트**:
    - 검색 및 필터가 포함된 툴바
    - 정렬 가능한 컬럼 헤더
    - 카테고리 데이터용 패싯 필터
    - 페이지네이션 컨트롤
    - 대량 작업 유틸리티
    - 컬럼 표시 옵션
- **컬럼 정의**: TanStack React Table의 컬럼 정의 패턴 사용

### 폼 컴포넌트

- **프레임워크**: React Hook Form + Zod 검증
- **폼 컴포넌트**: `src/components/ui/form.tsx` (Shadcn)
- **패턴**: Zod로 스키마 정의 → `useForm` 훅 사용 → `Form` 래퍼로 렌더링

### 레이아웃 컴포넌트

- **앱 레이아웃**: `src/components/layout/authenticated-layout.tsx`
- **사이드바**: `src/components/layout/app-sidebar.tsx` (네비게이션은 `src/components/layout/data/sidebar-data.ts`에서 정의)
- **헤더**: `src/components/layout/header.tsx` (사용자 프로필 및 테마 스위처)

## 기능 모듈 구조

기능은 도메인별로 조직됩니다 (예: `src/features/users`, `src/features/auth`). 일반적인 기능 구조:

- **index.tsx**: 메인 컴포넌트/페이지
- **components/**: 기능 특화 UI 컴포넌트
- **types.ts**: TypeScript 인터페이스/타입
- **columns.ts** (테이블용): React Table 컬럼 정의
- **hooks/** (선택사항): 커스텀 훅
- **constants.ts** (선택사항): 상수 및 구성

## 주요 유틸리티

- **`cn()`** (`src/lib/utils.ts`): Tailwind 클래스를 clsx와 tailwind-merge로 안전하게 병합
- **`getPageNumbers()`** (`src/lib/utils.ts`): 생략 부호가 있는 페이지네이션 번호 생성
- **`handleServerError()`** (`src/lib/handle-server-error.ts`): Axios 에러 추출 및 토스트 알림으로 표시
- **쿠키 유틸리티** (`src/lib/cookies.ts`): 쿠키 가져오기, 설정, 제거 (유지용)

## 일반적인 개발 작업

### 새 페이지/라우트 추가

1. `src/routes/` 디렉토리에 `.tsx` 파일 생성
2. TanStack Router의 `createFileRoute()` 사용하여 `Route` 컴포넌트 익스포트
3. 데이터 페칭에 React Query의 `useQuery()` 또는 `useMutation()` 사용
4. 라우트가 자동으로 `routeTree.gen.ts`에 생성됨

### 새 기능 모듈 추가

1. `src/features/[기능명]/` 폴더 생성
2. `components/` 서브폴더 생성 (UI 컴포넌트용)
3. `index.tsx` 생성 (메인 기능 컴포넌트)
4. `types.ts` 생성 (TypeScript 정의)
5. 데이터 테이블 사용 시 `columns.ts` 생성

### Shadcn 컴포넌트 업데이트

```bash
# 커스터마이징되지 않은 컴포넌트 (안전하게 직접 업데이트)
yarn dlx shadcn@latest add [컴포넌트명]

# 커스터마이징/RTL 컴포넌트는 커스터마이징 보존을 위해 수동으로 병합
```

### 인증 처리

- 인증 상태는 `useAuthStore`(Zustand)에서 관리
- 401 응답은 자동으로 인증 리셋 및 `/sign-in`으로 리다이렉트
- `_authenticated`로 감싼 라우트는 레이아웃으로 보호됨
- 토큰은 쿠키에 저장되고 페이지 로드 시 복원됨

### 에러 처리 추가

- API 에러: `handleServerError()` 사용 (자동 토스트 표시)
- 라우트 레벨 에러: `GeneralError` 컴포넌트로 처리
- 404: `NotFoundError` 컴포넌트로 처리
- 특정 에러 페이지: 401, 403, 500, 503
