package com.sismics.docs.rest.util;

import org.json.JSONObject;
import org.apache.commons.codec.binary.Base64;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.util.Arrays;
import java.nio.charset.StandardCharsets;

/**
 * @author baidu.com
 * @date 2024/2/2
 */
public class TranslationUtil {
    private static final String TRANSLATE_BASE_ROOT = "https://fanyi-api.baidu.com";

    /**
     * 创建翻译任务
     */
    public static final String CREATE_TRANS_JOB = "/transapi/doctrans/createjob/trans";
    /**
     * 查询翻译进度
     */
    public static final String QUERY_TRANS_JOB = "/transapi/doctrans/query/trans";

    /**
     * 我的 APPID 和密钥
     */
    private static final String APPID = "20250514002357158";
    private static final String SECRET = "BRV2DLxN2sahH5rYbCWB";

    /**
     * post 请求
     *
     * @param url
     * @param body
     */
    public static String doPost(String url, JSONObject body) {
        CloseableHttpClient httpClient = HttpClientBuilder.create().build();
        try {
            // 创建post请求
            HttpPost request = new HttpPost(TRANSLATE_BASE_ROOT + url);
            signAndAddHeaders(body, request);
            StringEntity requestEntity = new StringEntity(body.toString(), StandardCharsets.UTF_8);
            request.setEntity(requestEntity);

            //执行post请求
            HttpResponse httpResponse = httpClient.execute(request);
            //获取响应消息实体
            HttpEntity responseEntity = httpResponse.getEntity();
            //判断响应实体是否为空
            if (responseEntity != null) {
                return EntityUtils.toString(responseEntity);
            }
        } catch (Exception e) {
            printMsg("doPost Error");
            e.printStackTrace();
        } finally {
            try {
                // 关闭流并释放资源
                httpClient.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 生成签名并添加到header
     */
    private static void signAndAddHeaders(JSONObject body, HttpPost request) {
        try {
            // Step1: 传入http请求中的body（原始json串，保留原始格式）字符串作为字符串1。
            String str1 = body.toString();

            // Step2. 将 APPID(X-Appid)，时间戳(X-Timestamp)， 字符串1，按照APPID+时间戳+字符串1顺序拼接得到字符串2。
            // 10位时间戳 - 秒
            long timeSecond = System.currentTimeMillis() / 1000;
            String str2 = APPID + timeSecond + str1;

            // Step3. 对字符串2 做hmac_sha256加密，密钥使用平台分配的密钥(可在管理控制台查看) 得到字符串3。
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(SECRET.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] str3 = sha256_HMAC.doFinal(str2.getBytes());

            // Step4. 对字符串3 做base64编码得到X-Sign。
            String sign = Base64.encodeBase64String(str3);
            printMsg("sign: " + sign);
            request.addHeader("Content-Type", "application/json");
            request.addHeader("X-Appid", APPID);
            request.addHeader("X-Sign", sign);
            request.addHeader("X-Timestamp", "" + timeSecond);
        } catch (Exception e) {
            printMsg("signAndAddHeaders Error");
        }
    }

    private static void printMsg(String template, Object... args) {
        System.out.println(String.format(template, args));
    }
}
