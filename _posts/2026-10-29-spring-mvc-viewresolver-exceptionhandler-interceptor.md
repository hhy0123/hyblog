---
layout: post
title: "redirect로 사라진 데이터를 살리는 법, 그리고 예외와 인터셉터"
date: 2026-10-29 16:40:00 +0900
categories: [Spring-MVC]
tags: [spring-mvc, viewresolver, redirectattributes, controlleradvice, interceptor]
mermaid: true
---

Servlet에서 "redirect는 이전 요청을 모른다"고 배웠던 그 문제를 Spring이 어떻게 풀어내는지, 그리고 전역 예외처리와 Interceptor까지 하루에 훑은 학습 노트다.

<!--more-->

## Servlet에서 남겨둔 숙제를 Spring이 풀어주다 (Situation)

Servlet의 redirect 글 끝에 "이전 요청을 모른다는 게 redirect의 단점이고 Cookie/Session이 그걸 극복한다"고 적어뒀는데, 오늘 Spring이 그 문제를 **세션을 직접 다루지 않고도** 해결하는 방법을 보여줬다. View를 반환하는 세 가지 방법, 전역 예외처리, 그리고 Controller 전후에 끼어드는 Interceptor까지 이어서 배웠다.

## 배운 내용 (Task)

목표는 Controller가 View를 반환하는 세 가지 방식(void/String/ModelAndView)과 redirect 시 데이터가 사라지는 문제를 `RedirectAttributes`로 해결하는 법, `@ControllerAdvice`로 예외처리를 전역화하는 법과 지역·전역 핸들러의 우선순위, 그리고 `HandlerInterceptor`로 Controller 전후에 공통 로직을 끼워넣는 법을 이해하는 것이었다.

## 정리한 내용 (Action)

### View 반환 3가지, 그리고 redirect의 함정

```java
@GetMapping("/string-redirect")
public String redirect(RedirectAttributes rttr) {
    System.out.println("회원가입 완료!!!");

    // redirect는 2번의 요청이 발생 -> 최초 model 값은 재요청에서 사라진다
    // model.addAttribute("forwardMessage", "...");  // 이렇게 하면 소용없음!

    rttr.addFlashAttribute("flashMessage", "리다이렉트 된 페이지에서도 유지되는 값!");
    return "redirect:/";
}
```

Spring에서 View 반환 기본값은 **forward**이고, `redirect:` 접두사를 붙여야만 진짜 redirect가 된다는 것부터 새로웠다. 그리고 Servlet에서 배운 "redirect는 새 요청이라 이전 데이터가 사라진다"는 문제가 Spring MVC에서도 똑같이 재현됐다 — `model.addAttribute()`로 넣은 값은 redirect 후 사라진다. 대신 `RedirectAttributes.addFlashAttribute()`를 쓰면, **내부적으로 세션에 잠깐 담아뒀다가 다음 요청에서 한 번 꺼내 쓰고 지우는 방식**으로 값을 유지해준다는 걸 알고 나니, Servlet 때 "Cookie/Session을 써야 한다"고 배운 걸 Spring이 더 편한 API로 감싸놨다는 느낌을 받았다.

```mermaid
flowchart LR
    A["return \"result\" (forward, 기본값)"] -->|Model 값 유지| B[같은 요청 안에서 뷰 렌더링]
    C["return \"redirect:/\""] -->|Model 값 소멸| D[새 요청 발생]
    D --> E["addFlashAttribute 로 넣은 값만 1회성으로 생존"]
```

### @ControllerAdvice — 흩어진 예외처리를 한 곳으로

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NullPointerException.class)
    public String nullHandler(Model model, NullPointerException e) {
        model.addAttribute("key", e.getMessage());
        return "error/nullPointer";
    }

    @ExceptionHandler(Exception.class)
    public String defaultException(Model model, Exception e) {
        model.addAttribute("message", e.getMessage());
        return "error/default";
    }
}
```

주석에 "AOP의 Advice처럼, 반복해야 하는 예외처리 코드를 묶어둔 것"이라고 적혀 있어서 어제 배운 AOP와 바로 연결됐다. **지역 핸들러(같은 컨트롤러 안의 `@ExceptionHandler`)가 전역 핸들러보다 우선순위가 높다**는 것도 직접 확인했다 — `ExceptionTestController` 안에 local `nullHandler`가 있으면 그게 먼저 동작하고, 그런 로컬 핸들러가 없는 `GlobalTestController`에서 NPE가 나면 `GlobalExceptionHandler`가 대신 받는다.

```java
@ExceptionHandler(MemberNotFoundException.class)
public String userException(Model model, NullPointerException e) {  // 어라?
    model.addAttribute("key", e.getMessage());
    return "error/nullPointer";
}
```

여기서 실수를 하나 했다 — `nullHandler`를 복붙해서 만들다가, `@ExceptionHandler(MemberNotFoundException.class)`인데 파라미터 타입은 `NullPointerException`으로 안 고쳤다. **어노테이션에 명시한 예외 타입과 메소드 파라미터 타입이 안 맞으면** 제대로 처리가 안 될 수 있다는 걸 코드를 다시 보다가 알아챘다 — 복붙 후에는 시그니처 전체를 다시 확인해야 한다는 교훈을 얻었다.

### Interceptor — Controller 전후를 가로채기

```java
@Component
public class TimerInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;  // false면 핸들러 메소드 자체가 호출 안 됨
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) {
        long interval = System.currentTimeMillis() - (long) request.getAttribute("startTime");
        modelAndView.addObject("interval", interval);
    }
}
```

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final TimerInterceptor timerInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timerInterceptor)
                .addPathPatterns("/*")
                .excludePathPatterns("/css/**", "/js/**", "/video/**");
    }
}
```

Servlet의 `Filter`와 매우 비슷해 보였는데, 가장 큰 차이는 **Interceptor는 Spring MVC 영역(Controller 앞뒤)에서 동작**하고 `preHandle()`이 `false`를 반환하면 핸들러 메소드 자체가 호출되지 않는다는 것이었다. `addPathPatterns`/`excludePathPatterns`로 정적 리소스(css/js/video)는 제외하는 것도 지난번 Filter의 `@WebFilter("/*")` 패턴과 똑같은 고민이었다.

## 결과 (Result)

redirect가 데이터를 날려버리는 문제를 Servlet 때는 Session/Cookie로 풀어야 했는데, Spring은 `RedirectAttributes.addFlashAttribute()`라는 더 편한 API로 감싸놨다는 걸 확인했다. `@ControllerAdvice`로 예외처리를 전역화하면서 지역/전역 우선순위를 이해했고, 복붙하다 타입을 안 맞춘 실수도 직접 겪었다. Interceptor는 Filter와 비슷하지만 Spring MVC 레이어에서 동작한다는 위치 차이를 체감한 하루였다.

## 더 학습하면 좋은 개념

- **Filter vs Interceptor 호출 순서** — 둘 다 "앞뒤로 감싼다"는 점이 같아서 헷갈리는데, 실제 요청이 들어왔을 때 Filter와 Interceptor 중 뭐가 먼저 동작하는지 순서도를 그려서 정리해봐야겠다.
- **`@ExceptionHandler`의 반환 타입 다양화** — 오늘은 전부 뷰 이름(String)을 반환했는데, API 서버라면 `ResponseEntity`나 JSON을 반환해야 할 텐데 그 차이는 다음에 봐야 한다.
- **`afterCompletion()`** — `HandlerInterceptor`에는 `preHandle`/`postHandle` 말고 `afterCompletion()`도 있다는 걸 API에서 봤는데, 오늘 예제에서는 안 썼다. 예외가 났을 때도 호출되는지 확인해봐야겠다.

## 참고 자료

- [Spring 공식 문서 - Redirect Attributes](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/redirecting-passing-data.html)
- [Spring 공식 문서 - Exception Handling](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html)
- [Spring 공식 문서 - Interceptors](https://docs.spring.io/spring-framework/reference/web/webmvc/handlermapping/interceptor.html)
