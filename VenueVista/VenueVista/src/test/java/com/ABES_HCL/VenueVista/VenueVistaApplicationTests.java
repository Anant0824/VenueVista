package com.ABES_HCL.VenueVista;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.DefaultCorsProcessor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = {
		"venuevista.admin.email=admin-test@example.com",
		"venuevista.admin.password=test-password-with-at-least-16-chars"
})
class VenueVistaApplicationTests {

	@Autowired
	private CorsConfigurationSource corsConfigurationSource;

	@Test
	void contextLoads() {
	}

	@Test
	void allowsCredentialedPreflightFromVercelPreviewOrigin() throws Exception {
		String previewOrigin = "https://venuevista-git-feature-example.vercel.app";
		MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/payments/create-order");
		request.addHeader("Origin", previewOrigin);
		request.addHeader("Access-Control-Request-Method", "POST");
		request.addHeader("Access-Control-Request-Headers", "authorization,content-type");
		MockHttpServletResponse response = new MockHttpServletResponse();

		CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(request);
		assertTrue(new DefaultCorsProcessor().processRequest(configuration, request, response));
		assertEquals(previewOrigin, response.getHeader("Access-Control-Allow-Origin"));
		assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
		assertTrue(response.getHeader("Access-Control-Allow-Methods").contains("POST"));
		assertTrue(response.getHeader("Access-Control-Allow-Headers").contains("authorization"));
	}
}
