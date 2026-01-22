# language: zh-TW
# encoding: UTF-8
# Feature: 播放直播串流
# Epic: G - 影像播放（Live / Replay）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-g @video @command
Feature: 播放直播串流
  身為 操作員
  我想要 播放直播串流
  以便 即時觀看訓練現場

  Rule: 成功播放直播串流

    @happy-path
    Example: 成功播放直播串流
      Given 直播串流 "rtsp://camera1.local/live" 可用
      When 操作員 播放直播串流 "rtsp://camera1.local/live"
      Then 直播應開始播放
      And 播放狀態應為 "PLAYING"

    @happy-path
    Example: 暫停直播串流
      Given 直播串流正在播放中
      When 操作員 暫停直播串流
      Then 直播應暫停
      And 播放狀態應為 "PAUSED"

    @happy-path
    Example: 繼續播放已暫停的直播
      Given 直播串流目前為暫停狀態
      When 操作員 繼續播放直播串流
      Then 直播應繼續播放
      And 播放狀態應為 "PLAYING"

  Rule: 前置條件驗證

    @error-handling
    Example: 串流不可用應播放失敗
      Given 直播串流 "rtsp://camera1.local/live" 不可用
      When 操作員 播放直播串流 "rtsp://camera1.local/live"
      Then 應回傳錯誤 "串流不可用"

    @error-handling
    Example: 無效的串流 URL 應播放失敗
      When 操作員 播放直播串流 "invalid-url"
      Then 應回傳錯誤 "無效的串流 URL"
