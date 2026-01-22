# language: zh-TW
# encoding: UTF-8
# Feature: 選擇單球檢視
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-d @pitch @command
Feature: 選擇單球檢視
  身為 教練
  我想要 選擇單一投球檢視
  以便 查看詳細的投球數據與軌跡

  Rule: 成功選擇單球檢視

    @happy-path
    Example: 選擇投球顯示九宮格數據
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 投球清單中存在投球 "P001"
      When 教練 選擇投球 "P001"
      Then 應顯示投球 "P001" 的詳細資訊
      And 應顯示九宮格落點數據

    @happy-path
    Example: 選擇投球顯示 3D 軌跡
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 投球清單中存在投球 "P001"
      And 目前檢視模式為 "3D軌跡"
      When 教練 選擇投球 "P001"
      Then 應顯示投球 "P001" 的詳細資訊
      And 應顯示 3D 軌跡數據

  Rule: 切換選擇的投球

    @happy-path
    Example: 切換選擇不同投球
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 目前已選擇投球 "P001"
      When 教練 選擇投球 "P002"
      Then 應顯示投球 "P002" 的詳細資訊
      And 投球 "P001" 應取消選擇狀態
