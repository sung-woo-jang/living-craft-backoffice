# API 파일 생성 컨벤션 가이드

공새로 프로젝트에서 FSD(Feature-Sliced Design) 구조를 따라 API 파일을 생성할 때의 컨벤션 가이드입니다.

## 📁 폴더 구조

```
src/features/{feature-name}/api/
├── {api-name}/
│   ├── index.ts           # Barrel export
│   ├── types.ts           # API 타입 정의
│   └── use{ApiName}.ts    # React Query 훅
├── types.ts               # 공통 타입 (선택사항)
└── index.ts               # 전체 API Barrel export
```

## 📝 파일별 작성 규칙

### 1. API 훅 파일 (`use{ApiName}.ts`)

#### 기본 템플릿

```typescript
import { ApiResponse, axiosInstance } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { useStandardQuery, useStandardMutation } from '@/shared/hooks';
import { generateQueryKeysFromUrl } from '@/shared/lib';

import type { RequestType, ResponseType } from './types';

// API 함수 정의
const fetchApiFunction = async (params?: RequestType) => {
  const { data } = await axiosInstance.get<ApiResponse<ResponseType>>(
    API_ENDPOINTS.FEATURE.ENDPOINT,
  );
  return data;
};

// React Query 훅 export
export const useFetchApiFunction = () => {
  return useStandardQuery<ResponseType>({
    queryKey: generateQueryKeysFromUrl(API_ENDPOINTS.FEATURE.ENDPOINT),
    queryFn: fetchApiFunction,
  });
};
```

#### 네이밍 규칙

**API 함수명 패턴:**
- `fetch{EntityName}` - 조회 (GET)
- `create{EntityName}` - 생성 (POST)
- `update{EntityName}` - 수정 (PUT/PATCH)
- `delete{EntityName}` - 삭제 (DELETE)

**React Query 훅명 패턴:**
- `useFetch{EntityName}` - Query 훅
- `useCreate{EntityName}` - Mutation 훅
- `useUpdate{EntityName}` - Mutation 훅
- `useDelete{EntityName}` - Mutation 훅

#### HTTP 메서드별 패턴

**GET 요청 (Query 훅)**
```typescript
const fetchDestinationList = async () => {
  const { data } = await axiosInstance.get<ApiResponse<DestinationListResponse>>(
    API_ENDPOINTS.DESTINATION.LIST,
  );
  return data;
};

export const useFetchDestinationList = () => {
  return useStandardQuery<DestinationListResponse>({
    queryKey: generateQueryKeysFromUrl(API_ENDPOINTS.DESTINATION.LIST),
    queryFn: fetchDestinationList,
  });
};
```

**POST 요청 (Mutation 훅) - 응답 데이터가 있는 경우**
```typescript
const createPurchaseRequest = async (body: PurchaseRequestCreateRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<PurchaseRequestCreateResponse>>(
    API_ENDPOINTS.BID.PURCHASE_REQUEST.CREATE,
    body,
  );
  return data;
};

export const usePurchaseRequestCreate = () => {
  return useStandardMutation<PurchaseRequestCreateResponse, Error, PurchaseRequestCreateRequest>({
    mutationFn: createPurchaseRequest,
  });
};
```

**POST 요청 (Mutation 훅) - 응답 데이터가 없는 경우 (void Response)**
```typescript
const updateAssetBookmark = async (body: BookmarkRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<void>>(
    API_ENDPOINTS.ASSET.BOOKMARK,
    body,
  );
  return data;
};

export const useAssetBookmark = () => {
  return useStandardMutation<void, Error, BookmarkRequest>({
    mutationFn: updateAssetBookmark,
  });
};
```

**POST 요청 with 검색 기능 (Mutation 훅)**
```typescript
const fetchProductList = async ({ pageCount = 30, ...body }: ProductListRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<ProductListResponse>>(
    API_ENDPOINTS.PRODUCT.LIST,
    { ...body, pageCount },
  );
  return data;
};

export const useProductList = () => {
  return useStandardMutation<ProductListResponse, Error, ProductListRequest>({
    mutationFn: fetchProductList,
  });
};
```

**파일 업로드 (FormData)**
```typescript
const uploadFile = async ({ file }: FileUploadRequest) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await formInstance.post<ApiResponse<FileUploadResponse>>(
    API_ENDPOINTS.UPLOAD,
    formData,
  );
  return data;
};

export const useFileUpload = () => {
  return useStandardMutation<FileUploadResponse, Error, FileUploadRequest>({
    mutationFn: uploadFile,
  });
};
```

### 2. 타입 정의 파일 (`types.ts`)

#### 기본 템플릿

```typescript
// 공통 엔티티 타입 (필요한 경우)
export interface EntityName {
  /**
   * 설명
   * @format int32
   * @example 123
   */
  id: number;
  /**
   * 이름
   * @example "샘플 이름"
   */
  name: string;
}

// Request 타입
export interface EntityNameRequest {
  /**
   * 필수 파라미터
   * @format int32
   */
  requiredParam: number;
  /** 선택 파라미터 */
  optionalParam?: string;
}

// Response 타입
export interface EntityNameResponse {
  /** 데이터 목록 */
  dataList: EntityName[];
  /**
   * 총 개수
   * @format int32
   */
  totalCount: number;
}
```

#### 타입 네이밍 규칙

- **Request 타입**: `{EntityName}{Action}Request`
  - 예: `PurchaseRequestCreateRequest`, `ProductListRequest`
- **Response 타입**: `{EntityName}{Action}Response`
  - 예: `DestinationListResponse`, `FileUploadResponse`
  - **응답 데이터가 없는 경우**: 별도 Response 타입을 정의하지 않고 `ApiResponse<void>` 사용
- **엔티티 타입**: `{EntityName}`
  - 예: `Destination`, `Product`

#### JSDoc 주석 규칙

```typescript
export interface ExampleEntity {
  /**
   * 필드 설명 (한국어)
   * @format int32        // 숫자 타입의 경우
   * @format date         // 날짜 타입의 경우
   * @format double       // 소수점 타입의 경우
   * @example 123         // 예시값
   */
  fieldName: number;
}
```

### 3. 공통 타입 정의 (`types.ts`)

#### 피처 레벨 공통 타입 파일
```typescript
// src/features/{feature-name}/api/types.ts
// 여러 API에서 공통으로 사용되는 타입들을 정의

export interface IImageInfo {
  /**
   * 이미지 번호
   * @format int32
   */
  imageNo?: number;
  /** 이미지 URL */
  imageUrl?: string;
  /** 메인 이미지 여부 */
  mainImage?: boolean;
  /**
   * 생성일시
   * @format date-time
   */
  createdDate?: string;
}

export interface IUserInfo {
  /** 사용자 이름 */
  name?: string;
  /** 전화번호 */
  phone?: string;
}

// 각 API별 types.ts에서 import하여 사용
// import type { IImageInfo, IUserInfo } from '../types';
```

### 4. Index 파일 (`index.ts`)

#### API 폴더별 index.ts
```typescript
export * from './types';
export * from './useApiFunction';
```

#### 피처 전체 API index.ts
```typescript
export * from './api-name-1';
export * from './api-name-2';
export * from './types';
```

## 🔧 사용하는 유틸리티

### HTTP 클라이언트
- `axiosInstance` - JSON 요청용
- `formInstance` - 파일 업로드용 (FormData)

### React Query 훅
- `useStandardQuery` - GET 요청용
- `useStandardMutation` - POST/PUT/DELETE 요청용 (기본 사용)
- `useCachedMutation` - 캐싱이 필요한 검색 기능용 (특별한 경우에만 사용, 별도 변경 예정)

> **⚠️ 중요**: API 파일 생성 시에는 항상 `useStandardMutation`을 사용하세요. `useCachedMutation`은 특별한 캐싱이 필요한 검색 기능에서만 사용되며, 필요한 경우 별도로 변경됩니다.

### 상수 및 유틸
- `API_ENDPOINTS` - API 엔드포인트 상수
- `generateQueryKeysFromUrl` - Query Key 생성 유틸
- `createQueryString` - URL 쿼리 스트링 생성 유틸

## 📋 체크리스트

API 파일 생성 시 다음 사항들을 확인하세요:

### ✅ 필수 확인사항
- [ ] `src/shared/constants/api.ts`에 API 엔드포인트가 정의되어 있는가?
- [ ] 폴더명이 kebab-case로 작성되었는가?
- [ ] 훅 파일명이 `use{PascalCase}.ts` 형식인가?
- [ ] 타입명이 `{EntityName}{Action}Request/Response` 형식인가?
- [ ] 응답 데이터가 없는 API는 `ApiResponse<void>` 타입을 사용했는가?
- [ ] 공통 타입이 중복되는 경우 피처 레벨 `types.ts`에서 관리하고 있는가?
- [ ] JSDoc 주석이 한국어로 작성되었는가?
- [ ] index.ts에서 모든 export가 정의되었는가?

### ✅ 코드 품질
- [ ] Early return 패턴이 적용되었는가?
- [ ] 적절한 TypeScript 타입이 정의되었는가?
- [ ] 일관된 네이밍 컨벤션이 적용되었는가?
- [ ] 불필요한 중복 코드가 없는가?

### ✅ API 설계
- [ ] HTTP 메서드가 REST API 규칙에 맞는가?
- [ ] Request/Response 타입이 명확하게 정의되었는가?
- [ ] 에러 처리가 고려되었는가?
- [ ] 필요한 경우 파라미터 기본값이 설정되었는가?

## 🔍 실제 예시

### 간단한 조회 API
```typescript
// src/features/destination/api/destination-list/useDestinationList.ts
import { ApiResponse, axiosInstance } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { useStandardQuery } from '@/shared/hooks';
import { generateQueryKeysFromUrl } from '@/shared/lib';

import type { DestinationListResponse } from './types';

const fetchDestinationList = async () => {
  const { data } = await axiosInstance.get<ApiResponse<DestinationListResponse>>(
    API_ENDPOINTS.DESTINATION.LIST,
  );
  return data;
};

export const useFetchDestinationList = () => {
  return useStandardQuery<DestinationListResponse>({
    queryKey: generateQueryKeysFromUrl(API_ENDPOINTS.DESTINATION.LIST),
    queryFn: fetchDestinationList,
  });
};
```

### 복잡한 생성 API
```typescript
// src/features/purchase-request/api/purchase-request-create/usePurchaseRequestCreate.ts
import { ApiResponse, axiosInstance } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { useStandardMutation } from '@/shared/hooks';

import { PurchaseRequestCreateRequest, PurchaseRequestCreateResponse } from './types';

const createPurchaseRequest = async (body: PurchaseRequestCreateRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<PurchaseRequestCreateResponse>>(
    API_ENDPOINTS.BID.PURCHASE_REQUEST.CREATE,
    body,
  );
  return data;
};

export const usePurchaseRequestCreate = () => {
  return useStandardMutation<PurchaseRequestCreateResponse, Error, PurchaseRequestCreateRequest>({
    mutationFn: createPurchaseRequest,
  });
};
```

## 🛠️ 유틸리티 함수 활용

### createQueryString 사용법

URL 쿼리 파라미터가 필요한 API에서는 `createQueryString` 유틸리티를 활용하세요.

```typescript
import { createQueryString } from '@/shared/lib';

// 쿼리 파라미터가 있는 GET 요청
const fetchDataWithParams = async (params: SearchParams) => {
  const queryString = createQueryString(params);
  const { data } = await axiosInstance.get<ApiResponse<SearchResponse>>(
    `${API_ENDPOINTS.SEARCH.LIST}${queryString}`,
  );
  return data;
};

// 동적 Query Key 생성 (캐싱용)
export const useSearchData = (params: SearchParams) => {
  return useStandardQuery<SearchResponse>({
    queryKey: generateQueryKeysFromUrl(
      `${API_ENDPOINTS.SEARCH.LIST}${createQueryString(params)}`
    ),
    queryFn: () => fetchDataWithParams(params),
    enabled: !!params.keyword, // 검색어가 있을 때만 실행
  });
};
```

#### createQueryString 특징
- **자동 정렬**: 키를 알파벳 순으로 정렬하여 일관된 URL 생성
- **유효값 필터링**: `undefined`, `null` 값은 자동으로 제외
- **배열 처리**: 배열 값은 콤마로 구분하여 문자열로 변환
- **빈 값 처리**: 유효한 파라미터가 없으면 빈 문자열 반환

```typescript
// 사용 예시
createQueryString({ page: 1, tags: ['react', 'typescript'], category: 'frontend' })
// 결과: "?category=frontend&page=1&tags=react,typescript"

createQueryString({ search: '', page: undefined, limit: 10 })
// 결과: "?limit=10" (빈 값과 undefined는 제외됨)
```

이 컨벤션을 따라 일관성 있는 API 구조를 유지하시기 바랍니다.