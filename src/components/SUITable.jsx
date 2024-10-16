import { useContext } from "react";

import {
  TableRow,
  TableHeaderCell,
  TableHeader,
  TableFooter,
  TableCell,
  TableBody,
  Button,
  Icon,
  Table,
} from "semantic-ui-react";
import { ModalContext } from "../Layout";

const SUITable = () => {
  const { setShowModal } = useContext(ModalContext);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>CourseID</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
          <TableHeaderCell>No. of Students</TableHeaderCell>
          <TableHeaderCell>Average Grade</TableHeaderCell>
          <TableHeaderCell>Submitted</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell>Test 101</TableCell>
          <TableCell>05 April 2024</TableCell>
          <TableCell>2</TableCell>
          <TableCell>-</TableCell>
          <TableCell>10 April 2024</TableCell>
          <TableCell>Ungraded</TableCell>
        </TableRow>
      </TableBody>

      <TableFooter fullWidth>
        <TableRow>
          <TableHeaderCell colSpan="6">
            <Button
              floated="right"
              icon
              labelPosition="left"
              primary
              size="small"
              onClick={() => setShowModal(true)}
            >
              <Icon name="user" /> Grade
            </Button>
          </TableHeaderCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default SUITable;
