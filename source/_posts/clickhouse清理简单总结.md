## clickhouse清理简单总结

> 背景：clickhouse磁盘占用过大，需要清理以腾出可用空间，对clickhouse不太熟悉，记录一下处理过程，以供参考

1. 先查看哪些表占用空间最多：

```sql
SELECT
    database,
    table,
    formatReadableSize(sum(bytes_on_disk)) AS total_size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes_on_disk) DESC
```

![[Pasted image 20250512154446.png]]

2. 查询结果如上，query_thread_log，query_log是 ClickHouse 的系统操作日志表，占用空间很大，基本可以判断是**日志保留时间过长或配置异常**导致的。

3. delete删除很慢，大表的情况下几乎不能使用，（保险些）不清除全表的情况下可以按分区清理。先确认下这个表是否有分区。
```sql
SELECT *
FROM system.tables
WHERE name = 'query_thread_log' AND database = 'system';
```
建表结果如下：
```sql
-- 省略
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
-- 省略
```
看出，确实按照event_time进行分区。

4. 我们可以先来清理历史分区
```sql
ALTER TABLE system.query_thread_log DROP PARTITION 202312;
```
5. 使用sql查询已有分区也会卡住，可以查看目录文件确认有哪些分区
```bash
cd ${ck_home}/data/system/query_thread_log
ls
```
可以看到如下目录（看起来一直没有清理过）：
![[Pasted image 20250512155534.png]]
6. 同样地，`query_log`也可以清理

7. 进一步，可以创建定时任务，来定时清理过期的日志文件，保持磁盘空间。

8. 若确认近期的日志也不需要，则可以直接清空整张表
```sql
-- 清空 query_log 表
TRUNCATE TABLE system.query_log;

-- 清空 query_thread_log 表
TRUNCATE TABLE system.query_thread_log;
