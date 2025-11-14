import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function AccountCard({
  account_id,
  service,
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
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
