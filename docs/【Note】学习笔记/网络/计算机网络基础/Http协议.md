# HTTP协议
是基于TCP实现的应用层协议
## HTTP请求
常用：
- GET，获取资源，参数附加在url后面如（？key1=value）
- POST：创建资源或者提交数据，请求体（JSON/表单数据）
其他：
- PUT、DELETE、PATCH、HEAD、OPTION等，不怎么用

# HTTPS协议
使用SSL/TLS在传输层进行加密，服务器需要数字证书进行验证，哈希算法保证数据完整性。