# language: zh-TW
# encoding: UTF-8
# Feature: 切換檢視模式
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-d @pitch @command
Feature: 切換檢視模式
  身為 教練
  我想要 切換投球檢視模式
  以便 從不同視角分析投球數據

  Rule: 檢視模式切換

    @happy-path
    Example: 切換至九宮格模式
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 目前檢視模式為 "3D軌跡"
      When 教練 切換檢視模式為 "九宮格"
      Then 檢視模式應為 "九宮格"
      And 應顯示九宮格視圖

    @happy-path
    Example: 切換至 3D 軌跡模式
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 目前檢視模式為 "九宮格"
      When 教練 切換檢視模式為 "3D軌跡"
      Then 檢視模式應為 "3D軌跡"
      And 應顯示 3D 軌跡視圖

    @happy-path
    Example: 切換模式時保留目前選擇的投球
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 目前已選擇投球 "P001"
      And 目前檢視模式為 "九宮格"
      When 教練 切換檢視模式為 "3D軌跡"
      Then 投球 "P001" 應維持選擇狀態
      And 應顯示投球 "P001" 的 3D 軌跡
