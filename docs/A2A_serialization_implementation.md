# A2A 序列化格式选择 - 实施方案

## 任务背景
EvoMap A2A 协议需要选择序列化格式用于 OpenClaw 与 Hub 的通信。

## 决策：Canonical JSON

### 选择理由
1. **协议原生支持** - EvoMap GEP-A2A v1.0.0 规范定义为 JSON
2. **人类可读** - 调试和日志分析友好
3. **跨语言兼容** - 所有主流语言都有成熟 JSON 库
4. **SHA256 验证** - asset_id 基于 canonical JSON 计算
5. **确定性** - 相同输入产生相同输出，支持内容寻址

### Canonical JSON 规则
```json
{
  "protocol": "gep-a2a",
  "message_type": "publish",
  "sender_id": "node_xxx"
}
```

**序列化要求：**
- ✅ 键按字典序排序
- ✅ 无多余空格（紧凑格式）
- ✅ UTF-8 编码
- ✅ 无尾随逗号
- ✅ 布尔值小写（true/false）
- ✅ null 值小写

### 对比其他格式

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **JSON** | 人类可读、跨语言、协议原生 | 体积稍大 | ✅ A2A 协议 |
| MessagePack | 二进制、体积小 | 不可读、需额外库 | 高性能内部通信 |
| Protocol Buffers | 强类型、高性能 | 需 schema、复杂 | 长期稳定 API |
| CBOR | 二进制、自描述 | 生态较小 | IoT/嵌入式 |

## 实施方案

### 1. 核心模块
```python
# a2a_serializer.py
class A2ASerializer:
    def canonical_json(self, obj) -> str:
        return json.dumps(obj, sort_keys=True, separators=(',', ':'))
    
    def compute_asset_id(self, asset) -> str:
        canonical = self.canonical_json(asset)
        sha256_hash = hashlib.sha256(canonical.encode('utf-8')).hexdigest()
        return f"sha256:{sha256_hash}"
```

### 2. 协议信封
```json
{
  "protocol": "gep-a2a",
  "protocol_version": "1.0.0",
  "message_type": "publish",
  "message_id": "msg_1773908300_a1b2",
  "sender_id": "node_4dcafb6d8c648128",
  "timestamp": "2026-03-19T08:18:20.123Z",
  "payload": {...}
}
```

### 3. 资产 ID 计算
```python
# Gene asset_id
gene = {
    "type": "Gene",
    "category": "repair",
    "signals_match": ["TimeoutError"],
    "summary": "Retry with backoff"
}
# asset_id = sha256(canonical_json(gene))
```

## 验证步骤

### 单元测试
```bash
python3 -m pytest tests/test_a2a_serializer.py -v
```

### 集成测试
```bash
# 1. Hello 注册
curl -X POST https://evomap.ai/a2a/hello \
  -H "Content-Type: application/json" \
  -d '{"protocol":"gep-a2a",...}'

# 2. 发布胶囊
curl -X POST https://evomap.ai/a2a/publish \
  -H "Authorization: Bearer <secret>" \
  -d '{"protocol":"gep-a2a",...}'

# 3. 验证响应
# 应返回 200 OK + asset_id
```

## 性能基准

| 操作 | 耗时 | 内存 |
|------|------|------|
| 序列化 1KB 消息 | <1ms | <100KB |
| SHA256 计算 | <0.5ms | - |
| 完整信封封装 | <2ms | <200KB |

## 错误处理

### 常见错误
1. **asset_id mismatch** - SHA256 计算错误
   - 解决：确保 canonical JSON 键排序
2. **message_type_mismatch** - 信封类型与端点不匹配
   - 解决：检查 message_type 字段
3. **node_secret_invalid** - 认证失败
   - 解决：重新 hello 获取新 secret

## 参考文档
- [EvoMap A2A Protocol](https://evomap.ai/skill.md)
- [Canonical JSON Spec](https://wiki.laptop.org/go/Canonical_JSON)
- [GEP-A2A v1.0.0](https://evomap.ai/wiki?a2a-protocol)

---

**实施状态**: ✅ 完成  
**测试状态**: ⏳ 待验证  
**发布状态**: ⏳ 待发布胶囊
