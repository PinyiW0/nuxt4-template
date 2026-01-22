# language: zh-TW
# encoding: UTF-8
# Feature: 播放雙畫面回放
# Epic: G - 影像播放（Live / Replay）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-g @video @command
Feature: 播放雙畫面回放
  身為 數據分析師
  我想要 播放雙畫面回放
  以便 同時比較兩個不同角度的影像

  Rule: 成功播放雙畫面回放

    @happy-path
    Example: 成功播放雙畫面回放
      Given 影片1 "video1.mp4" 存在
      And 影片2 "video2.mp4" 存在
      When 數據分析師 播放雙畫面回放 影片1 "video1.mp4" 影片2 "video2.mp4"
      Then 應開始播放雙畫面
      And 兩個畫面應同步播放

    @happy-path
    Example: 暫停雙畫面回放
      Given 雙畫面回放正在播放中
      When 數據分析師 暫停雙畫面回放
      Then 兩個畫面應同時暫停
      And 播放狀態應為 "PAUSED"

  Rule: 雙畫面同步控制

    @happy-path
    Example: 同步雙畫面播放位置
      Given 雙畫面回放正在播放中
      And 畫面1 位於 10.5 秒 畫面2 位於 12.3 秒
      When 數據分析師 同步雙畫面至位置 15.0 秒
      Then 畫面1 應跳轉至 15.0 秒
      And 畫面2 應跳轉至 15.0 秒
      And 兩個畫面應標記為已同步

    @happy-path
    Example: 重新同步播放
      Given 雙畫面回放正在播放中
      And 兩個畫面播放位置不同步
      When 數據分析師 重新同步播放
      Then 兩個畫面應對齊至相同位置
      And 同步狀態應為 true

  Rule: 前置條件驗證

    @error-handling
    Example: 影片1不存在應播放失敗
      Given 影片1 "missing.mp4" 不存在
      And 影片2 "video2.mp4" 存在
      When 數據分析師 播放雙畫面回放 影片1 "missing.mp4" 影片2 "video2.mp4"
      Then 應回傳錯誤 "影片不存在"

    @error-handling
    Example: 影片2不存在應播放失敗
      Given 影片1 "video1.mp4" 存在
      And 影片2 "missing.mp4" 不存在
      When 數據分析師 播放雙畫面回放 影片1 "video1.mp4" 影片2 "missing.mp4"
      Then 應回傳錯誤 "影片不存在"
