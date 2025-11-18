# 🔧 Workaround: Use Direct Database Connection

## ❌ Problem

The `statement_cache_size=0` parameter via `connect_args` is not working with SQLAlchemy's asyncpg dialect when using Supabase's Transaction Pooler (port 6543).

## ✅ Workaround Solution

**Use Direct Database Connection (port 5432) instead of Transaction Pooler (port 6543)**

According to Supabase documentation, direct connections support prepared statements and don't have the pgbouncer limitation.

## 📝 Steps

1. **Get Direct Connection String from Supabase:**
   - Go to Supabase Dashboard → Project Settings → Database
   - Find "Connection string" section
   - Select "Direct connection" (port 5432) instead of "Transaction pooler" (port 6543)
   - Copy the connection string

2. **Update Vercel Environment Variable:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Update `DATABASE_URL` to use the direct connection string (port 5432)
   - Example: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Note on Connection Pooling:**
   - Direct connections don't have connection pooling at the database level
   - However, since we're using `NullPool` in serverless (stateless), this is fine
   - Each request gets a new connection, which is appropriate for serverless

## ⚠️ Trade-offs

**Direct Connection (port 5432):**
- ✅ Supports prepared statements
- ✅ No pgbouncer limitations
- ✅ Works with asyncpg out of the box
- ❌ No connection pooling at DB level (but we use NullPool anyway)
- ❌ May hit connection limits under high load (but serverless limits this naturally)

**Transaction Pooler (port 6543):**
- ✅ Better connection pooling for high traffic
- ❌ Doesn't support prepared statements
- ❌ Requires `statement_cache_size=0` which isn't working with SQLAlchemy

## 🚀 Recommendation

For serverless (Vercel), use **Direct Connection (port 5432)** because:
1. We're using `NullPool` anyway (stateless)
2. Each request gets a new connection
3. No connection pooling needed at DB level for this use case
4. Simpler and more reliable

