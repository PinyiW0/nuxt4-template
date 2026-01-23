# language: zh-TW
# encoding: UTF-8
# Feature: 單球儀表板
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-d @pitch @query
Feature: 單球儀表板
  身為 教練
  我想要 切換九宮格落點與 3D 入壘軌跡
  以便 用不同視角理解投球

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1
    And 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"
    And 該訓練有投球資料，球速 128，轉速 2100，好球，落點 X=0.2 Y=0.3
    And 教練 已進入訓練 "2026-01-20" 的紀錄頁

  Rule: 可以查看九宮格落點圖

    @happy-path
    Example: 顯示九宮格落點圖
      When 教練 選擇查看投球的九宮格落點圖
      Then 應顯示九宮格落點圖
      And 落點應標示在座標 X=0.2 Y=0.3
      And 應標示該球為好球

    @happy-path
    Example: 九宮格顯示壞球位置
      Given 該訓練有投球資料，球速 125，轉速 2000，壞球，落點 X=-0.5 Y=0.8
      When 教練 選擇查看投球的九宮格落點圖
      Then 應顯示九宮格落點圖
      And 落點應標示在座標 X=-0.5 Y=0.8
      And 應標示該球為壞球

  Rule: 可以查看 3D 入壘軌跡

    @happy-path
    Example: 顯示 3D 入壘軌跡
      When 教練 選擇查看投球的 3D 入壘軌跡
      Then 應顯示 3D 入壘軌跡圖
      And 應顯示投球軌跡動畫

  Rule: 可以切換視圖

    @happy-path
    Example: 從九宮格切換到 3D 軌跡
      Given 教練 正在查看九宮格落點圖
      When 教練 切換到 3D 入壘軌跡
      Then 應顯示 3D 入壘軌跡圖

    @happy-path
    Example: 從 3D 軌跡切換到九宮格
      Given 教練 正在查看 3D 入壘軌跡
      When 教練 切換到九宮格落點圖
      Then 應顯示九宮格落點圖
