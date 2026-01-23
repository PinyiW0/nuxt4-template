# language: zh-TW
# encoding: UTF-8
# Feature: 選手統計明細
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-f @player-stats @query
Feature: 選手統計明細
  身為 分析使用者
  我想要 查看選手的月平均統計與分佈圖
  以便 追蹤長期表現

  Background:
    Given 分析使用者 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1

  Rule: 可以查看月平均統計

    @happy-path
    Example: 顯示選手月平均統計
      Given 球員 "王小明" 在 2026-01 有 100 筆投球
      And 球員 "王小明" 在 2025-12 有 80 筆投球
      When 分析使用者 查看選手 "王小明" 的統計明細
      Then 應顯示月平均統計表
      And 2026-01 應顯示平均球速、平均轉速、好球率、投球數
      And 2025-12 應顯示平均球速、平均轉速、好球率、投球數

    @happy-path
    Example: 月統計依時間倒序排列
      Given 球員 "王小明" 有 3 個月的投球紀錄
      When 分析使用者 查看選手 "王小明" 的統計明細
      Then 月統計應依時間倒序排列
      And 最新月份應顯示在最前

  Rule: 可以查看投球分佈熱區圖

    @happy-path
    Example: 顯示投球分佈熱區圖
      Given 球員 "王小明" 有 200 筆投球紀錄
      When 分析使用者 查看選手 "王小明" 的統計明細
      Then 應顯示投球分佈熱區圖
      And 熱區圖應標示投球密集區域

    @happy-path
    Example: 熱區圖區分好壞球
      Given 球員 "王小明" 有 100 筆好球和 50 筆壞球
      When 分析使用者 查看選手 "王小明" 的統計明細
      Then 熱區圖應可區分好球和壞球分佈

  Rule: 無投球紀錄時顯示提示

    @boundary
    Example: 選手無投球紀錄
      Given 球員 "王小明" 沒有任何投球紀錄
      When 分析使用者 查看選手 "王小明" 的統計明細
      Then 應顯示 "尚無投球紀錄"
      And 不應顯示熱區圖
