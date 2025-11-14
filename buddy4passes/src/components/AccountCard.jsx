import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function AccountCard({
  account_id,
  service,
  service_email,
  service_username,
  service_password,
  selected,
  onSelect,
}) {
  return (
    <Card
      sx={{
        "&[data-active]": {
          backgroundColor: "rgb(135, 206, 250)",
          "&:hover": {
            backgroundColor: "action.selectedHover",
          },
        },
      }}
      data-active={selected ? "" : undefined}
    >
      <CardActionArea onClick={() => onSelect?.(account_id)}>
        <CardContent>
          <Typography variant="h6" component="div">
            {service}
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
            Email: {service_email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Username: {service_username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Passwort: {service_password}
          </Typography> */}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
