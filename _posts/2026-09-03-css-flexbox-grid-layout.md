---
layout: post
title: "div만 쌓으면 세로로 눕는 카드를 Flexbox와 Grid로 눕히기"
date: 2026-09-03 14:30:00 +0900
categories: [웹개발]
tags: [css, flexbox, grid, tailwind, frontend]
mermaid: true
---

## 어제에 이어 카드 레이아웃을 배웠다 (Situation)

어제([선택자 이론은 아는데 왜 안 골라질까 — CSS Diner로 조합 감 잡기]({{ '/posts/css-selector-basics-css-diner/' | relative_url }}))에 이어 오늘은 선택자 우선순위, 블록/인라인 요소의 차이, 그리고 레이아웃을 잡는 Flexbox와 Grid를 배웠다. 실습은 "오늘의 추천 상품" 카드 목록을 만드는 것이었는데, 처음엔 `div`로 카드만 감싸놓고 끝이었다.

## 문제 상황 (Task)

`div`로만 카드 영역을 나누면 두 가지 문제가 있었다.

1. `div`는 기본이 블록 요소라서 가로 폭을 전부 차지하고, 카드가 위에서 아래로 세로로 쌓인다.
2. 화면 크기를 늘리거나 줄여도 카드 배치가 그 크기에 맞춰 유연하게 바뀌지 않는다.

카드 3장을 가로로 나란히 두면서, 화면 크기가 바뀌어도 자연스럽게 줄 바꿈이 되는 배치가 필요했다.

## 해결 과정 (Action)

### 1) 선택자 우선순위 먼저 정리

레이아웃 코드를 짜기 전에, 같은 요소에 스타일이 여러 개 겹칠 때 뭐가 이기는지부터 정리했다.

```
!important > 인라인 스타일 > ID 선택자 > 클래스 선택자 > 태그 선택자 > 전체 선택자
```

인라인 스타일(`style="background: green;"`)이 ID 선택자보다 우선하고, `!important`가 붙으면 클래스 선택자라도 인라인 스타일까지 뒤집는다는 걸 직접 배경색을 겹쳐보면서 확인했다.

### 2) 블록과 인라인의 차이부터 짚기

`div`(블록)는 자기 줄을 통째로 차지해서 아래로 쌓이고, `span`(인라인)은 옆으로 붙는다. `display` 속성으로 이 기본값을 서로 바꿔볼 수도 있었다.

```css
.box-block-span {
    display: block; /* span인데도 자기 줄을 차지하게 됨 */
}

.box-inline-div {
    display: inline; /* div인데도 옆으로 붙게 됨 */
}
```

`div`가 세로로 쌓이는 문제의 근본 원인이 바로 이 블록 요소의 기본 성질이라는 걸 확인하고, 카드 3장을 감싸는 부모(`div로만 나눈 상태`)에 배치 방식을 새로 지정해야 한다는 결론에 닿았다.

### 3) Flexbox로 카드 3장을 가로로 배치

플렉스박스는 항목을 한 방향 줄로 세우는 배치 방식이다. `display: flex`는 카드 자신이 아니라 카드를 감싸는 상자(플렉스 컨테이너)에 줘야 하고, 그 안의 카드들이 플렉스 아이템이 된다.

```css
.card-list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
}
```

여기서 두 축 개념이 핵심이었다.

| 축 | 기준 | 이번 실습에서 담당한 정렬 |
|----|------|---------------------------|
| 주축(main axis) | `flex-direction`이 정한 방향(기본 `row` = 가로) | `justify-content: space-between` — 카드를 양 끝에 붙이고 사이 간격을 고르게 |
| 교차축(cross axis) | 주축과 직각인 방향(가로가 주축이면 세로) | `align-items: flex-start` — 카드를 위쪽 끝에 맞춤 |

`align-items`의 기본값은 `stretch`라서 그대로 두면 모든 카드가 컨테이너 높이만큼 늘어나 높이가 똑같아 보인다. 그런데 카드 중 하나만 설명(`desc`) 문단이 한 줄 더 있어서 원래 다른 카드보다 길다. `align-items: flex-start`로 바꾸고 나서야 각 카드가 늘어나지 않고 자기 내용만큼만 높이를 가지면서, 설명이 있는 카드만 실제로 더 길어 보이는 걸 확인할 수 있었다. `flex-wrap: wrap`은 화면을 좁혔을 때 카드가 밖으로 넘치지 않고 아래 줄로 내려가게 하기 위해 넣었다.

### 4) Grid로 카드 6장을 격자로 배치

플렉스가 "한 줄로 세우고 정렬"이라면, 그리드는 "칸을 미리 그려두고 그 칸에 채워 넣는" 방식이라는 설명이 인상적이었다.

```css
.grid-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
```

`repeat(3, 1fr)`은 "남은 공간을 3등분한 열을 3개 만든다"는 뜻이다. 행의 개수는 따로 지정하지 않았는데, 열을 3개로 고정하면 아이템 6개가 자동으로 2행으로 채워지기 때문이다. 열만 정하고 행은 내용에 맞춰 자동으로 계산되게 놔둔다는 점이 플렉스와 다른 그리드만의 감각이었다.

| | Flexbox | Grid |
|---|---------|------|
| 기본 방향 | 한 방향(행 또는 열) | 행과 열 동시 |
| 배치 감각 | 줄을 세우고 정렬 | 칸을 그려서 채움 |
| 이번 실습 | 카드 3장, 가로 한 줄 | 카드 6장, 3열 격자 |

### 5) 직접 짠 CSS vs Tailwind/Bootstrap 유틸리티 클래스

같은 카드 목록을 두 가지 방식으로 다시 만들어봤다. 하나는 지금까지처럼 `style.css` 파일에 직접 클래스를 정의하는 방식(`06_before-tailwind.html`)이고, 다른 하나는 Tailwind와 Bootstrap의 유틸리티 클래스를 태그에 바로 붙이는 방식(`07_after_tailwind.html`)이다.

```html
<!-- Tailwind: 클래스 이름 자체가 스타일 -->
<div class="bg-white border border-gray-200 rounded-lg p-4 transition
            hover:bg-gray-50 hover:-translate-y-2 hover:scale-105 hover:shadow-lg">
```

CSS 파일을 따로 열어보지 않아도 `hover:-translate-y-2`, `hover:scale-105`만 봐도 "마우스를 올리면 위로 살짝 뜨면서 커진다"는 게 바로 읽혔다. 대신 태그 하나에 붙는 클래스 목록이 눈에 띄게 길어지는 것도 체감했다.

## 결과 (Result)

| 항목 | Before | After |
|------|--------|-------|
| 카드 3장 배치 | `div`만 사용, 세로로 쌓임 | `display: flex`로 가로 정렬, 화면 폭에 따라 자동 줄바꿈 |
| 카드 6장 배치 | (해당 없음) | `display: grid` + `repeat(3, 1fr)`로 3열 격자, 행은 자동 계산 |
| 카드 높이 정렬 | 미정 (조정 전) | `align-items: flex-start`로 내용 길이에 따라 개별 높이 유지 |
| 스타일 작성 방식 | 커스텀 CSS 파일에 클래스 정의 | Tailwind/Bootstrap 유틸리티 클래스를 태그에 직접 부여 |

정량 지표로 남기긴 어렵지만, `div`만으로는 절대 해결이 안 되던 "가로 배치 + 유연한 줄바꿈"이 플렉스 속성 몇 줄로 해결되는 걸 직접 확인한 게 가장 큰 소득이다. 특히 `align-items`의 기본값(`stretch`)을 그대로 뒀다면 카드 높이 차이가 아예 안 보였을 거라는 점에서, 기본값을 그냥 넘기지 않고 "왜 이 값을 쓰는지"를 따져보는 습관이 왜 필요한지 체감했다.

## 더 학습하면 좋은 개념

- **CSS Box Model(박스 모델)** — `padding`, `border`, `margin`이 실제 카드 크기에 어떻게 영향을 주는지 알아야 `flex`/`grid`로 배치한 카드의 간격과 크기를 정확히 예측할 수 있다.
- **Flexbox의 나머지 속성 (`flex-grow`, `flex-shrink`, `flex-basis`)** — 오늘은 정렬 위주로 배웠지만, 카드 하나하나가 남는 공간을 얼마나 차지할지는 이 세 속성이 결정한다.
- **`grid-template-areas`** — 지금은 단순 격자였지만, 헤더/사이드바/본문처럼 이름을 붙여 영역을 배치하는 그리드 레이아웃까지 알면 복잡한 페이지 구조도 그리드로 설계할 수 있다.
- **미디어 쿼리(`@media`)를 이용한 반응형 디자인** — `flex-wrap`이 자동으로 줄바꿈은 해주지만, 화면 크기별로 열 개수나 폰트 크기를 세밀하게 바꾸려면 미디어 쿼리가 필요하다.
- **Tailwind의 유틸리티 우선(Utility-First) 철학** — 클래스 하나마다 CSS 속성 하나씩 대응한다는 설계 사상을 알면, 클래스가 길어지는 이유와 이 방식이 노리는 장단점을 더 잘 이해할 수 있다.

## 참고 자료

- [MDN - Flexbox 기본 개념](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)
- [MDN - CSS Grid Layout](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_grid_layout)
- [MDN - display 속성](https://developer.mozilla.org/ko/docs/Web/CSS/display)
- [MDN - 명시도(Specificity)](https://developer.mozilla.org/ko/docs/Web/CSS/Specificity)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs/styling-with-utility-classes)
