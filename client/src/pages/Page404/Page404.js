import React from "react";

function Page404() {
  return (
    <div
      name="Page404"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <img
        src="/images/404.png"
        alt="404"
        style={{
          maxWidth: "300px",
          maxHeight: "300px",
        }}
      />
      <h2
        style={{ marginTop: "20px", fontSize: "24px", color: "var(--primary)" }}
      >
        Page Not Found
      </h2>
    </div>
  );
}

export default Page404;
