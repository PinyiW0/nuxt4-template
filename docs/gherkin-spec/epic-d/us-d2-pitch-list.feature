# language: zh-TW
# encoding: UTF-8
# Feature: 投球清單與即時刷新
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-d @pitch @query
Feature: 投球清單與即時刷新
  身為 教練
  我想要 看到該訓練下的投球清單並即時更新
  以便 及時查看最新投球數據

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1
    And 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"
    And 教練 已進入訓練 "2026-01-20" 的紀錄頁

  Rule: 可以查看投球清單

    @happy-path
    Example: 顯示投球清單
      Given 該訓練有 3 筆投球資料
      When 教練 查看投球清單
      Then 應顯示 3 筆投球
      And 每筆投球應包含球速、轉速、好壞球判定

    @boundary
    Example: 無投球資料時顯示空列表
      Given 該訓練沒有任何投球資料
      When 教練 查看投球清單
      Then 應顯示 0 筆投球
      And 應顯示 "尚無投球資料"

  Rule: 投球清單即時更新

    @happy-path
    Example: 新投球即時顯示
      Given 該訓練有 2 筆投球資料
      And AI 系統目前運作中
      When AI 系統偵測到新投球，球速 130，轉速 2200，好球
      Then 投球清單應自動更新
      And 應顯示 3 筆投球
      And 最新一筆投球球速應為 130

    @happy-path
    Example: 連續投球依時間順序顯示
      Given 該訓練有 1 筆投球資料
      And AI 系統目前運作中
      When AI 系統連續偵測到 3 筆新投球
      Then 應顯示 4 筆投球
      And 投球應依時間順序顯示（最新在最前或最後）
