# frozen_string_literal: true

source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "webrick", "~> 1.8" # 로컬 `jekyll serve` 실행에 필요 (Ruby 3+ 기본 미포함)

group :jekyll_plugins do
  gem "jekyll-paginate", "~> 1.1" # 홈 화면 페이지네이션(1, 2, 3 ...)
end

gem "html-proofer", "~> 5.0", group: :test

platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.2.0", :platforms => [:windows]
