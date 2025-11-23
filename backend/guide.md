# For Test Create merchant:

```
curl -XPOST http://localhost:4000/merchant/create -H "Content-Type: application/json" -d '{"name":"demo"}'

```

# For Test Create transaction::

```
curl -XPOST http://localhost:4000/transactions -H "Content-Type: application/json" \
 -d '{"merchantId":"<MERCHANT_ID>","amount":5000}'


```

# For Test List transactions:

```
curl "http://localhost:4000/transactions?merchantId=<MERCHANT_ID>&limit=10&offset=0"


```

# For Test Create payment URL (quick):

```
curl -XPOST http://localhost:4000/payment/create/<MERCHANT_ID> -H "Content-Type: application/json" -d '{"amount":1000}'


```
