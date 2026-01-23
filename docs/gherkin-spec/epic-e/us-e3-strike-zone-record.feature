# language: zh-TW
# encoding: UTF-8
# Feature: 電子好球帶記錄分析
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-e @strike-zone @query
Feature: 電子好球帶記錄分析
  身為 分析使用者
  我想要 查看單筆訓練的電子好球帶記錄
  以便 檢視每球的投球品質

  Background:
    Given 分析使用者 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1
    And 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"

  Rule: 可以查看訓練的電子好球帶記錄

    @happy-path
    Example: 顯示電子好球帶記錄
      Given 該訓練有 50 筆投球，其中 30 筆好球，20 筆壞球
      When 分析使用者 進入訓練 "2026-01-20" 的明細頁
      Then 應顯示電子好球帶記錄
      And 應顯示總投球數 50
      And 應顯示好球數 30
      And 應顯示壞球數 20
      And 應顯示好球率 60%

    @happy-path
    Example: 顯示投球落點分佈
      Given 該訓練有 20 筆投球資料
      When 分析使用者 進入訓練 "2026-01-20" 的明細頁
      Then 應顯示九宮格落點分佈圖
      And 每個落點應標示好壞球

  Rule: 可以開啟單球圖表彈窗

    @happy-path
    Example: 點擊單球開啟詳細彈窗
      Given 該訓練有投球資料，球速 130，轉速 2200
      When 分析使用者 進入訓練 "2026-01-20" 的明細頁
      And 分析使用者 點擊該投球
      Then 應開啟單球圖表彈窗
      And 彈窗應顯示球速 130
      And 彈窗應顯示轉速 2200
      And 彈窗應顯示九宮格落點圖

    @happy-path
    Example: 彈窗可切換到 3D 軌跡
      Given 該訓練有投球資料，球速 130，轉速 2200
      And 分析使用者 已開啟單球圖表彈窗
      When 分析使用者 在彈窗中切換到 3D 軌跡
      Then 彈窗應顯示 3D 入壘軌跡圖
